import { MainApp } from '@/components/MainApp';
import { Toaster } from 'sonner';

export default function Home() {
  return (
    <>
      <MainApp />
      <Toaster position="top-right" richColors />
    </>
  );
}
