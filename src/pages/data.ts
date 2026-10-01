import type { Account } from '../molecules';
import type { Garment } from '../organisms';
import { demoAvatar } from '../docs/helpers';

/** Демо-данные экранов флоу: общие для нескольких разделов. */

/** Вещи в сетке гардероба. */
export const grid: Garment[] = ['top', 'container', 'bottom', 'shoe', 'outerwear', 'accessories', 'top', 'bottom'];

/** Кроссовки в вишлисте и в результатах поиска. */
export const shoes = ["Nike Air Force 1 '07 Edge", 'Nike Ava Edge', 'Nike Ava Edge', 'Nike Ava Edge'];

/** Текущий аккаунт: везде с фото (Figma avatar · Content=Photo), как в таб-баре и «Avatar Added» (#216, строка 19). */
export const sima: Account = { id: 'sima', name: 'Сима', email: 'sima@space.com', color: 'blue', photo: demoAvatar };
export const tina: Account = { id: 'tina', name: 'Тинатин', email: 'hello@tin.ru', color: 'orange' };
