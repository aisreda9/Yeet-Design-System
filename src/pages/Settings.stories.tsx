import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Flag, Icon, Logo } from '../atoms';
import { demoAvatar } from '../docs/helpers';
import { AccountCard, Field, InputBar, InputGroup, List, ListGroup, ListItem, StatRow, StatTile } from '../molecules';
import { Dialog, Header, Overlay, Sheet } from '../organisms';
import { Prose, Screen } from '../templates';
import { sima } from './data';
import { privacy, terms } from './legal';
import './pages.css';

/* Раздел: настройки и удаление аккаунта. Id историй — pages-экраны-флоу--<slug> (flow-diff). */
const meta = {
  title: 'Pages/Экраны флоу',
  parameters: {
    layout: 'centered', controls: { disable: true }, options: { showPanel: false },
    docs: { description: { component: 'Экраны флоу, собранные **только** из компонентов системы. Названия — как в Figma (`Раздел / Экран / Состояние`).' } },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const header = <Header type="bar" title="Настройки" />;

export const Settings: Story = {
  name: 'Settings / Main',
  render: () => (
    <Screen header={header}>
      {/* как во флоу: пары групп через 8, разделы через 20 */}
      <div className="y-stack-8">
        <AccountCard account={sima} kind="settings" />
        <ListGroup><ListItem label="Корзина вещей" trailing={<Icon name="chevron-right" />} onClick={() => {}} /></ListGroup>
      </div>
      <div className="y-stack-8">
        <InputGroup>
          <Field label="Страна" value="Россия" trailingIcon="chevron-up-down" />
          <Field label="Валюта" value="₽ · RUB" trailingIcon="chevron-up-down" />
        </InputGroup>
        <ListGroup>
          <ListItem label="Язык" trailing={<Icon name="external-link" />} onClick={() => {}} />
          <ListItem label="Уведомления" trailing={<Icon name="external-link" />} onClick={() => {}} />
        </ListGroup>
      </div>
      <ListGroup>
        {['Оценить приложение', 'Техническая поддержка', 'Идеи по доработке приложения', 'Сотрудничество'].map((l) => <ListItem key={l} label={l} trailing={<Icon name="external-link" />} onClick={() => {}} />)}
      </ListGroup>
      <div className="y-settings-footer">
        <Logo height={30} />
        <p className="y-caption">Политикой конфиденциальности <br />Условиями использования</p>
        <p className="y-caption">Версия 3.0.28</p>
        <Button variant="destructive" fullWidth>Удалить аккаунт</Button>
      </div>
    </Screen>
  ),
};

export const DeleteAccount: Story = {
  name: 'Settings / Delete Account / Dialog / Confirmation',
  render: () => (
    <Screen
      header={header}
      overlay={
        <Overlay>
          <Dialog tone="danger" title="Аккаунт будет удалён" description="Сима, твой аккаунт sima@space.com будет деактивирован." cancel="Отменить" confirm="Удалить">
            <p className="y-body y-text--secondary">Ты потеряешь:</p>
            <StatRow><StatTile size="L" label="Вещи" value={43} /><StatTile size="L" label="Образы" value={12} /><StatTile size="L" label="Вишлист" value={12} /></StatRow>
            <p className="y-body y-text--secondary">У тебя будет возможность восстановить аккаунт, войдя с тем же паролем в течение 14 дней.<br /><br />После этого все данные будут удалены навсегда.</p>
          </Dialog>
        </Overlay>
      }
    >
      <AccountCard account={sima} kind="settings" />
    </Screen>
  ),
};

export const CountrySheet: Story = {
  name: 'Settings / Country / Sheet / Default',
  render: () => (
    <Screen
      header={header}
      overlay={<Overlay><Sheet title="Страна"><InputBar size="L" placeholder="Поиск по странам" fieldIcon="search" /><List><ListItem type="radio" label="Россия" checked trailing={<Flag code="ru" />} /><ListItem type="radio" label="Беларусь" trailing={<Flag code="by" />} /><ListItem type="radio" label="Казахстан" trailing={<Flag code="kz" />} /><ListItem type="radio" label="Грузия" trailing={<Flag code="ge" />} /></List></Sheet></Overlay>}
    >
      <AccountCard account={sima} kind="settings" />
    </Screen>
  ),
};

export const CurrencySheet: Story = {
  name: 'Settings / Currency / Sheet / Default',
  render: () => (
    <Screen
      header={header}
      overlay={<Overlay><Sheet title="Валюта"><List><ListItem type="radio" label="Российский рубль" checked trailing="₽ · RUB" /><ListItem type="radio" label="Белорусский рубль" trailing="Br · BYN" /><ListItem type="radio" label="Казахстанский тенге" trailing="₸ · KZT" /><ListItem type="radio" label="Доллар США" trailing="$ · USD" /></List></Sheet></Overlay>}
    >
      <AccountCard account={{ ...sima, photo: demoAvatar }} kind="settings" />
    </Screen>
  ),
};

export const LegalPrivacy: Story = {
  name: 'Legal / Privacy Policy / May 2026',
  render: () => <Screen header={<Header type="bar" />}><Prose {...privacy} /></Screen>,
};

export const LegalTerms: Story = {
  name: 'Legal / Terms of Use / May 2026',
  render: () => <Screen header={<Header type="bar" />}><Prose {...terms} /></Screen>,
};

export const SignOutDialog: Story = {
  name: 'Settings / Sign Out / Dialog / Confirmation',
  render: () => (
    <Screen header={header} overlay={<Overlay><Dialog tone="destructive" title="Точно хочешь выйти?" description="Тебе потребуется снова войти в аккаунт, чтобы продолжить." cancel="Отменить" confirm="Выйти" /></Overlay>}>
      <AccountCard account={sima} kind="settings" />
    </Screen>
  ),
};
