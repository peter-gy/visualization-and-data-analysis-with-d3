import 'tailwindcss/tailwind.css';
import '@styles/globals.css';
import type { AppProps } from 'next/app';
import { AppDataProvider } from '@components/AppDataProvider/app-data-context';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <AppDataProvider>
            <Component {...pageProps} />
        </AppDataProvider>
    );
}
export default MyApp;
