import { useUserConfig } from '@contexts/user-config/UserConfigContext';
import { riskFactorData } from '@data/indicator-data';

function useSelectedRiskFactorData() {
    const {
        state: { selectedRiskFactor }
    } = useUserConfig();
    return riskFactorData[selectedRiskFactor];
}

export default useSelectedRiskFactorData;
