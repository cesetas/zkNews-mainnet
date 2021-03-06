import type { AppProps } from "next/app";
import Layout from "../components/Layout";
import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "web3uikit";
import "tailwindcss/tailwind.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MoralisProvider initializeOnMount={false}>
      <NotificationProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </NotificationProvider>
    </MoralisProvider>
  );
}

export default MyApp;
