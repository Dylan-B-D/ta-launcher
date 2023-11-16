import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { views, View } from './routes';

  const renderRoutes = (view: View) => {
    let routes: any[] = [];

    // If the view has a component and path, add its route
    if (view.path && view.component) {
      routes.push(
        <Route key={view.path} path={view.path} element={React.createElement(view.component)} />
      );
    }

    // If the view has subViews, add routes for each
    if (view.subViews) {
      view.subViews.forEach(subView => {
        routes = routes.concat(renderRoutes(subView));
      });
    }

    return routes;
  };

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to={views[0].path || '/fallback-path'} />} />
    {views.flatMap(view => renderRoutes(view))}
  </Routes>
);

export default AppRoutes;
