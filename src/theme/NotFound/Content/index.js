import React, { useEffect } from 'react';
import Content from '@theme-original/NotFound/Content';
import { track } from '@plausible-analytics/tracker';

// Report client-side 404s to Plausible so broken links surface in the dashboard.
export default function ContentWrapper(props) {
  useEffect(() => {
    track('404', { props: { path: window.location.pathname }, interactive: false });
  }, []);
  return <Content {...props} />;
}
