import LeftDrawerLayout from '@components/layout/LeftDrawerLayout';
import { Helmet } from 'react-helmet';
import DateRangePicker from '@components/controls/DateRangePicker';
import CountryPicker from '@components/controls/CountryPicker';
import MainGrid from '@components/layout/MainGrid';
import DrawerContent from '@components/layout/DrawerContent';

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
                    windowWidth >= 768 ? 0.5 * windowWidth : windowWidth
                }
                drawerContent={<DrawerContent />}
                mainContent={<MainGrid />}
            />
        </>
    );
}

export default App;
