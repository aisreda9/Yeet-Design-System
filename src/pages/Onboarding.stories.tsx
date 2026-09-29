import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Divider, Logo } from '../atoms';
import { Field, InputGroup, PhotoTile } from '../molecules';
import { BottomBar, Dialog, Header, Overlay } from '../organisms';
import { Row, Screen, Stack } from '../templates';
import './pages.css';

/* Раздел: запуск, онбординг, вход и восстановление пароля. Id историй — pages-экраны-флоу--<slug> (flow-diff). */
const meta = {
  title: 'Pages/Экраны флоу',
  parameters: {
    layout: 'centered', controls: { disable: true }, options: { showPanel: false },
    docs: { description: { component: 'Экраны флоу, собранные **только** из компонентов системы. Названия — как в Figma (`Раздел / Экран / Состояние`).' } },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Splash: Story = {
  name: 'App / Splash',
  render: () => (
    <Screen background="accent" center>
      <Row justify="center"><Logo height={56} /></Row>
    </Screen>
  ),
};

export const OnboardingWelcome: Story = {
  name: 'Onboarding / Welcome',
  render: () => (
    <Screen bottom={<BottomBar label="Начать бесплатно" />}>
      {/* флоу: заголовок на y70, подзаголовок через 12; ниже — место под анимацию */}
      <Stack gap={12} className="y-welcome">
        <h1 className="y-h1">Полный шкаф,<br />а надеть нечего?</h1>
        <p className="y-body y-text--secondary">Создавай образы из своих вещей,<br />находи похожие и покупай то, что действительно подходит твоему стилю</p>
      </Stack>
    </Screen>
  ),
};

export const FirstItemPrompt: Story = {
  name: 'Onboarding / First Item Prompt',
  render: () => (
    <Screen header={<Header type="back" title="Добавь первую вещь" subtitle="Сфотографируй вещь — фон удалим сами" textAction={{ label: 'Пропустить' }} />}>
      <Row gap={7}>
        <PhotoTile source="gallery" />
        <PhotoTile source="camera" />
      </Row>
    </Screen>
  ),
};

export const SignIn: Story = {
  name: 'Auth / Sign In',
  render: () => (
    <Screen header={<Header type="back" title="Вход и регистрация" />}>
      <InputGroup>
        <Field label="E-mail" input={{ type: 'email' }} />
        <Field label="Пароль" input={{ type: 'password' }} />
      </InputGroup>
      <Stack gap={8} align="center">
        <Button size="L" fullWidth>Войти</Button>
        <Button variant="ghost" size="L">Забыли пароль?</Button>
      </Stack>
      <Divider label="или" />
      <Button variant="secondary" size="L" leftIcon="apple" fullWidth>Войти с Apple</Button>
      <p className="y-caption y-text--secondary y-legal">Продолжая, вы соглашаетесь <br />с <a href="#">политикой конфиденциальности</a> <br />и <a href="#">условиями использования</a></p>
    </Screen>
  ),
};

const recoveryHeader = <Header type="back" title="Восстановление пароля" subtitle="Введи почту, на которую зарегистрирован аккаунт, — пришлём код для сброса пароля" />;

export const PasswordRecovery: Story = {
  name: 'Auth / Password Recovery',
  render: () => (
    <Screen header={recoveryHeader}>
      <InputGroup><Field label="E-mail" input={{ type: 'email', defaultValue: 'sima@space.com' }} /></InputGroup>
      <Button size="L" fullWidth>Отправить код</Button>
    </Screen>
  ),
};

export const PasswordRecoverySent: Story = {
  name: 'Auth / Password Recovery / Dialog / Sent',
  render: () => (
    <Screen header={recoveryHeader} overlay={<Overlay><Dialog title="Готово!" description="Мы отправили код для сброса пароля на sima@space.com" confirm="Ок!" /></Overlay>}>
      <InputGroup><Field label="E-mail" input={{ type: 'email', defaultValue: 'sima@space.com' }} /></InputGroup>
      <Button size="L" fullWidth>Отправить код</Button>
    </Screen>
  ),
};
