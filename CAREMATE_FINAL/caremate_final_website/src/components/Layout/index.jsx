import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '../Footer';
import Header from '../Header';

export default function Layout() {
  return (
    <>
      <Header logoSrc="/images/logo.PNG" variant="cs_heading_color" />
      <Outlet />
      <Footer />
    </>
  );
}
