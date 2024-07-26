import { Paper, Text, ThemeIcon, Avatar, rem } from '@mantine/core';
import classes from './CardGradient.module.css';
import { CardGradientProps } from '../interfaces';

export function CardGradient({ icon: Icon, image, gradient, title, description, link }: CardGradientProps) {
  return (
    <Paper
      withBorder
      radius="md"
      className={classes.card}
      component="a"
      href={link}
      target="_blank"
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {image ? (
          <Avatar src={image} alt={title} size={rem(44)} radius="md" />
        ) : (
          Icon && (
            <ThemeIcon
              size="xl"
              radius="md"
              variant="gradient"
              gradient={gradient}
            >
              <Icon style={{ width: rem(28), height: rem(28) }} />
            </ThemeIcon>
          )
        )}
        <Text size="md" fw={500} ml="xs">
          {title}
        </Text>
      </div>
      <Text size="sm" mt="md" color="dimmed">
        {description}
      </Text>
    </Paper>
  );
}
