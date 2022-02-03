import { iso31661Alpha3To2 } from '@data/country-iso-codes';

function CountryFlagIso2({ isoAlpha2 }: { isoAlpha2: string }) {
    return isoAlpha2 !== undefined ? <span className={`flag-icon flag-icon-${isoAlpha2.toLowerCase()}`} /> : <span />;
}

function CountryFlagIso3({ iso31661 }: { iso31661: string }) {
    const isoAlpha2 = iso31661Alpha3To2(iso31661);
    return <CountryFlagIso2 isoAlpha2={isoAlpha2} />;
}

export { CountryFlagIso2, CountryFlagIso3 };
