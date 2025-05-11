import PACSViewer from "../../components/PACSViewer";
import { MainLayout } from "../../components/layout/MainLayout";
import Head from "next/head";

export default function ViewerPage() {
  return (
    <>
      <Head>
        <title>PACS Viewer - RadGlobal RIS</title>
        <meta name="description" content="View and interpret medical images in the RadGlobal RIS system" />
      </Head>
      <MainLayout>
        <PACSViewer />
      </MainLayout>
    </>
  );
}
