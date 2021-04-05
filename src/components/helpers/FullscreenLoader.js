import { Layer, CenteredContent, CircularLoader } from "@dhis2/ui";

export const FullscreenLoader = () => 
    <Layer>
        <CenteredContent>
            <CircularLoader />
        </CenteredContent>
    </Layer>