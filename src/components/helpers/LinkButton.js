import { useHistory } from "react-router-dom";
import { Button } from "@dhis2/ui";

export const LinkButton = ({ to, children, ...props }) => {
    const history = useHistory()
    return <Button 
        onClick={() => history.push(to)}
        {...props}
    >
        {children}
    </Button>
}