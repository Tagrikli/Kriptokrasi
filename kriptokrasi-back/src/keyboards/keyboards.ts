import { Markup } from 'telegraf';
import { KeyboardList } from '../utils/types';
import { BUTTON_LIST } from './consts';
import _ from 'lodash';

let KEYBOARDS: KeyboardList;
KEYBOARDS = Object.create({});

for (const [key, value] of Object.entries(BUTTON_LIST)) {
    KEYBOARDS[key] = Markup.keyboard(_.chunk(value, 3)).resize().reply_markup;
}

export { KEYBOARDS };