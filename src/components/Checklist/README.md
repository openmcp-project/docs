# Checklist

Reusable interactive checklist for MDX pages. Includes numbered checkboxes that show a checkmark when completed, a progress bar, and highlighted checked rows with slightly muted, struck-through text. Uses the site's theme in light and dark mode.

## Usage

Use a `.mdx` page and import the component after its frontmatter:

```mdx
import Checklist from '@site/src/components/Checklist';

<Checklist
  title="Before you deploy"
  items={[
    {
      id: 'tests',
      title: 'Run the tests',
      expandable: true,
      description: <>Run <code>npm run build</code> and fix any errors.</>,
    },
    {
      id: 'review',
      title: 'Review your changes',
      description: <>Follow the <a href="/developers/contribution-guidelines">contribution guidelines</a>.</>,
    },
    {
      id: 'ready',
      title: 'Confirm you are ready to deploy',
    },
  ]}
/>
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `title` | string | Accessible checklist name and visible heading. Defaults to `Checklist`. |
| `items` | array | Checklist items in display order. |
| `items[].id` | string | Required unique, stable identifier within this checklist. |
| `items[].title` | React node | Required checkbox label. Use text or non-interactive formatting. |
| `items[].description` | React node | Optional supporting content. Can include links, inline code, or other JSX. |
| `items[].expandable` | boolean | Defaults to `false`. Set to `true` to put the description behind an “Instructions” disclosure, collapsed initially. |

Each checklist instance has independent state and unique checkbox IDs, so multiple checklists can appear on one page. Users can toggle an item with its checkbox or label, using a pointer or keyboard. Description links stay independently clickable.

Checks are personal reminders, not validation. State resets when the component unmounts or the page reloads; nothing is stored or sent to a server.
