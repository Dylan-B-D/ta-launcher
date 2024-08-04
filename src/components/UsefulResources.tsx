import { Grid, Title } from "@mantine/core";
import { discordResources, usefulResources } from "../data/usefulResources";
import { CardGradient } from "./CardGradient";



const UsefulResources = () => {
    return (
        <>
            <Title mt="md" order={5}>Discord Links</Title>
            <Grid  mt="4px">
                {discordResources.map((resource, index) => (
                    <Grid.Col span={4} key={index}>
                        <CardGradient
                            icon={resource.icon}
                            image={resource.image}
                            gradient={resource.gradient}
                            title={resource.title}
                            description={resource.description}
                            link={resource.link}
                        />
                    </Grid.Col>
                ))}
            </Grid>
            <Title mt="md" order={5}>Useful Resource Links</Title>
            <Grid mt="4px">
                {usefulResources.map((resource, index) => (
                    <Grid.Col span={4} key={index}>
                        <CardGradient
                            icon={resource.icon}
                            image={resource.image}
                            gradient={resource.gradient}
                            title={resource.title}
                            description={resource.description}
                            link={resource.link}
                        />
                    </Grid.Col>
                ))}
            </Grid>
        </>
    );
};

export default UsefulResources;