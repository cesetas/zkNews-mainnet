import Head from "next/head";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface ChildrenProps {
  children: any;
}

const Layout: React.FC<ChildrenProps> = ({ children }) => (
  <>
    <Head>
      <title>zkNews</title>
    </Head>
    <Navbar />
    {children}
    <Footer />
  </>
);

export default Layout;
