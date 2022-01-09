import LeftDrawerLayout from '@components/LeftDrawerLayout';
import { Helmet } from 'react-helmet';
import DateRangePicker from '@components/DateRangePicker';
import CountryPicker from '@components/CountryPicker';

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
                drawerContent={
                    <div className="p-4 flex flex-col justify-center items-start">
                        <div className="my-2">
                            <DateRangePicker />
                        </div>
                        <div className="my-2">
                            <CountryPicker />
                        </div>
                    </div>
                }
                mainContent={
                    <div className="bg-amber-100 h-screen flex justify-center items-center">
                        Hiya
                    </div>
                }
            />
        </>
    );
}

export default App;
