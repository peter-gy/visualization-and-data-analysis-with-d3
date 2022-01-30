import LeftDrawerLayout from '@components/LeftDrawerLayout';
import { Helmet } from 'react-helmet';
import DateRangePicker from '@components/DateRangePicker';
import CountryPicker from '@components/CountryPicker';
import MainGrid from '@components/MainGrid';
import DrawerContent from '@components/DrawerContent';

function App() {
    return (
        <>
            <Helmet>
                <meta charSet="utf-8" />
                <title>Covid-19 Dashboard</title>
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
                />
            </Helmet>
            <LeftDrawerLayout
                title="Covid-19 Dashboard"
                drawerWidth={(windowWidth) =>
                    windowWidth >= 768 ? 0.25 * windowWidth : windowWidth
                }
                drawerContent={<DrawerContent />}
                mainContent={<MainGrid />}
            />
        </>
    );
}

export default App;
