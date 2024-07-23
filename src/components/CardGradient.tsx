import { Paper, Text, ThemeIcon, rem } from '@mantine/core';
import classes from './CardGradient.module.css';
import { IconType } from 'react-icons';

interface CardGradientProps {
  icon: IconType;
  gradient: { deg: number; from: string; to: string };
  title: string;
  description: string;
  link: string;
}

export function CardGradient({ icon: Icon, gradient, title, description, link }: CardGradientProps) {
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
      <ThemeIcon
        size="xl"
        radius="md"
        variant="gradient"
        gradient={gradient}
      >
        <Icon style={{ width: rem(28), height: rem(28) }} />
      </ThemeIcon>
      <Text size="md" fw={500} mt="xs">
        {title}
      </Text>
      <Text size="sm" mt="xs" c="dimmed">
        {description}
      </Text>
    </Paper>
  );
}
