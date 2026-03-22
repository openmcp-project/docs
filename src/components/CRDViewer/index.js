import React, { useState, useEffect } from 'react';
import CodeBlock from '@theme/CodeBlock';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import yaml from 'js-yaml';

export default function CRDViewer({ crdUrl, name, description, exampleUrl }) {
  const [crdData, setCrdData] = useState(null);
  const [exampleData, setExampleData] = useState(null);
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch CRD
        const crdResponse = await fetch(crdUrl);
        const crdText = await crdResponse.text();
        setCrdData(crdText);

        // Parse CRD YAML to extract OpenAPI schema
        const crdObject = yaml.load(crdText);
        const specSchema = crdObject?.spec?.versions?.[0]?.schema?.openAPIV3Schema?.properties?.spec;

        if (specSchema) {
          setSchema(parseSchema(specSchema));
        }

        // Fetch example if provided
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

  const parseSchema = (schemaObj, prefix = '') => {
    const fields = [];

    if (!schemaObj || !schemaObj.properties) {
      return fields;
    }

    Object.entries(schemaObj.properties).forEach(([key, value]) => {
      const fieldName = prefix ? `${prefix}.${key}` : key;
      const type = getType(value);
      const description = value.description || 'No description available';
      const required = schemaObj.required?.includes(key) || false;

      fields.push({
        name: fieldName,
        type: type,
        description: description,
        required: required
      });

      // Recursively parse nested objects
      if (value.type === 'object' && value.properties) {
        fields.push(...parseSchema(value, fieldName));
      }

      // Handle arrays of objects
      if (value.type === 'array' && value.items?.properties) {
        fields.push(...parseSchema(value.items, `${fieldName}[]`));
      }
    });

    return fields;
  };

  const getType = (value) => {
    if (value.type === 'array' && value.items) {
      if (value.items.type) {
        return `${value.items.type}[]`;
      }
      return 'array';
    }
    return value.type || 'unknown';
  };

  if (loading) return <div className="crd-loading">Loading CRD...</div>;
  if (error) return <div className="crd-error">Error loading CRD: {error}</div>;
  if (!crdData) return null;

  return (
    <div className="crd-viewer">
      <div className="crd-header">
        <h3>{name}</h3>
        <p className="crd-description">{description}</p>
      </div>

      <Tabs>
        <TabItem value="schema" label="Schema" default>
          <div className="crd-schema">
            {schema && schema.length > 0 ? (
              <table className="crd-properties-table">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Type</th>
                    <th>Required</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {schema.map((prop, idx) => (
                    <tr key={idx}>
                      <td><code>{prop.name}</code></td>
                      <td><span className="crd-type-badge">{prop.type}</span></td>
                      <td>{prop.required ? <span className="crd-required-badge">Yes</span> : 'No'}</td>
                      <td>{prop.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Schema information not available. Please refer to the Full Definition tab.</p>
            )}
          </div>
        </TabItem>

        {exampleData && (
          <TabItem value="example" label="Example">
            <CodeBlock language="yaml" showLineNumbers title="Real example from the repository">
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
