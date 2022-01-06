import { Markup } from 'telegraf';
import { KeyboardList } from '../utils/types';
import { arrangeKeyboard } from '../utils/utils';
import { BUTTON_LIST } from './consts';


let KEYBOARDS: KeyboardList;
KEYBOARDS = Object.create({});

for (const [key, value] of Object.entries(BUTTON_LIST)) {
    KEYBOARDS[key] = Markup.keyboard(arrangeKeyboard(value)).resize().reply_markup;
}

export { KEYBOARDS };