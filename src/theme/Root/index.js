import React, { useEffect } from 'react';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

export default function Root({ children }) {
  useEffect(() => {
    if (!ExecutionEnvironment.canUseDOM) {
      return;
    }

    // Auto-collapse other sidebar categories when one is expanded
    const handleCategoryClick = () => {
      const sidebar = document.querySelector('.theme-doc-sidebar-menu');
      if (!sidebar) return;

      const categories = sidebar.querySelectorAll('.theme-doc-sidebar-item-category');

      categories.forEach(category => {
        const button = category.querySelector('.menu__link--sublist');
        if (!button) return;

        const originalClick = button.onclick;

        button.onclick = function(e) {
          // Get all other categories
          categories.forEach(otherCategory => {
            if (otherCategory !== category) {
              const otherButton = otherCategory.querySelector('.menu__link--sublist');
              const otherList = otherCategory.querySelector('.menu__list');

              if (otherList && !otherList.classList.contains('menu__list--collapsed')) {
                // Close the other category
                otherButton?.click();
              }
            }
          });

          // Let the original handler run
          if (originalClick) {
            originalClick.call(this, e);
          }
        };
      });
    };

    // Run on mount and after navigation
    handleCategoryClick();

    // Re-run when sidebar renders
    const observer = new MutationObserver(handleCategoryClick);
    const sidebar = document.querySelector('.theme-doc-sidebar-menu');
    if (sidebar) {
      observer.observe(sidebar, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, []);

  return <>{children}</>;
}
