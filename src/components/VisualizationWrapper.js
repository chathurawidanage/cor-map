import Visualization from "./Visualization"
import { useDataEngine } from "@dhis2/app-runtime"
import { useSavedObject } from "../services/dataStore/useSavedObject"
import { useParams, Redirect, Link } from "react-router-dom";
import { Button } from "@dhis2/ui-core";

export const VisualizationWrapper = () => {
    let { id } = useParams();
    const engine = useDataEngine()
    const [visualization, { remove }] = useSavedObject(id)

    if (!id || !visualization) {
        return <Redirect to="/" />
    }

    return <div>
        <Link to={`/`}>
            <Button>Home</Button>
        </Link>
        <Link to={`/visualization/${id}/edit`}>
            <Button>Edit</Button>
        </Link>
        <Button destructive onClick={() => remove()}>Delete</Button>
    </div>
    // return <Visualization engine={engine} visualization={visualization} />
}