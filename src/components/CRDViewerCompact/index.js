import React, { useState, useEffect } from 'react';
import CodeBlock from '@theme/CodeBlock';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import yaml from 'js-yaml';

const SchemaField = ({ field, depth = 0, searchTerm }) => {
  const hasChildren = field.children && field.children.length > 0;

  // Check if any children are required
  const hasRequiredChildren = field.children?.some(child =>
    child.required || hasRequiredDescendants(child)
  );

  // Auto-expand if: field is required, has required children, or matches search
  const shouldAutoExpand = field.required || hasRequiredChildren;

  const [isExpanded, setIsExpanded] = useState(shouldAutoExpand);

  // Check if this field or any children match the search
  const matchesSearch = searchTerm === '' ||
    field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.description.toLowerCase().includes(searchTerm.toLowerCase());

  const childrenMatch = field.children?.some(child =>
    child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto-expand if search matches children
  useEffect(() => {
    if (searchTerm && childrenMatch) {
      setIsExpanded(true);
    }
  }, [searchTerm, childrenMatch]);

  // Helper function to check if any descendants are required
  function hasRequiredDescendants(node) {
    if (!node.children || node.children.length === 0) return false;
    return node.children.some(child =>
      child.required || hasRequiredDescendants(child)
    );
  }

  if (!matchesSearch && !childrenMatch) {
    return null;
  }

  return (
    <div className={`schema-field schema-field-depth-${depth}`}>
      <div className="schema-field-header" onClick={() => hasChildren && setIsExpanded(!isExpanded)}>
        {hasChildren && (
          <span className={`schema-field-toggle ${isExpanded ? 'expanded' : ''}`}>
            ▶
          </span>
        )}
        <code className="schema-field-name">{field.name}</code>
        <span className="schema-field-type">{field.type}</span>
        {field.required && <span className="schema-field-required">required</span>}
      </div>

      {field.description && (
        <div className="schema-field-description">{field.description}</div>
      )}

      {hasChildren && isExpanded && (
        <div className="schema-field-children">
          {field.children.map((child, idx) => (
            <SchemaField key={idx} field={child} depth={depth + 1} searchTerm={searchTerm} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function CRDViewerCompact({ crdUrl, name, description, exampleUrl }) {
  const [crdData, setCrdData] = useState(null);
  const [exampleData, setExampleData] = useState(null);
  const [schema, setSchema] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const crdResponse = await fetch(crdUrl);
        const crdText = await crdResponse.text();
        setCrdData(crdText);

        const crdObject = yaml.load(crdText);
        const specSchema = crdObject?.spec?.versions?.[0]?.schema?.openAPIV3Schema?.properties?.spec;
        const statusSchema = crdObject?.spec?.versions?.[0]?.schema?.openAPIV3Schema?.properties?.status;

        const parsedFields = [];
        if (specSchema) {
          parsedFields.push({
            name: 'spec',
            type: 'object',
            description: 'Specification of the desired behavior',
            required: true,
            children: parseSchemaToTree(specSchema)
          });
        }
        if (statusSchema) {
          parsedFields.push({
            name: 'status',
            type: 'object',
            description: 'Observed status of the resource',
            required: false,
            children: parseSchemaToTree(statusSchema)
          });
        }

        setSchema(parsedFields);

        if (exampleUrl) {
          const exampleResponse = await fetch(exampleUrl);
          const exampleText = await exampleResponse.text();
          setExampleData(exampleText);
        }
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };

    loadData();
  }, [crdUrl, exampleUrl]);

  const parseSchemaToTree = (schemaObj) => {
    if (!schemaObj || !schemaObj.properties) {
      return [];
    }

    return Object.entries(schemaObj.properties).map(([key, value]) => {
      const field = {
        name: key,
        type: getType(value),
        description: value.description || '',
        required: schemaObj.required?.includes(key) || false,
        children: []
      };

      // Recursively parse nested objects
      if (value.type === 'object' && value.properties) {
        field.children = parseSchemaToTree(value);
      }

      // Handle arrays of objects
      if (value.type === 'array' && value.items?.properties) {
        field.children = parseSchemaToTree(value.items);
      }

      return field;
    });
  };

  const getType = (value) => {
    if (value.type === 'array' && value.items) {
      if (value.items.type) {
        return `[]${value.items.type}`;
      }
      if (value.items.properties) {
        return '[]object';
      }
      return '[]';
    }
    return value.type || 'unknown';
  };

  if (loading) return <div className="crd-loading">Loading CRD...</div>;
  if (error) return <div className="crd-error">Error loading CRD: {error}</div>;
  if (!crdData) return null;

  return (
    <div className="crd-viewer-compact">
      <Tabs>
        <TabItem value="schema" label="Schema" default>
          <div className="schema-search-container">
            <input
              type="text"
              placeholder="Search fields..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="schema-search-input"
            />
          </div>
          <div className="schema-tree">
            {schema.map((field, idx) => (
              <SchemaField key={idx} field={field} searchTerm={searchTerm} />
            ))}
          </div>
        </TabItem>

        {exampleData && (
          <TabItem value="example" label="Example">
            <CodeBlock
              language="yaml"
              showLineNumbers
              title={
                <a
                  href={exampleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  Real example from the repository ↗
                </a>
              }
            >
              {exampleData}
            </CodeBlock>
          </TabItem>
        )}

        <TabItem value="yaml" label="Full Definition">
          <CodeBlock language="yaml" showLineNumbers>
            {crdData}
          </CodeBlock>
        </TabItem>
      </Tabs>
    </div>
  );
}
