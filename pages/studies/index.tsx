import StudyWorklist from "../../components/StudyWorklist";
import { MainLayout } from "../../components/layout/MainLayout";
import Head from "next/head";

export default function StudiesPage() {
  return (
    <>
      <Head>
        <title>Study Worklist - RadGlobal RIS</title>
        <meta name="description" content="View and manage imaging studies in the RadGlobal RIS system" />
      </Head>
      <MainLayout>
        <StudyWorklist />
      </MainLayout>
    </>
  );
}
