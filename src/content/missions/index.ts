// 미션 묶음 — 미션별 파일을 합쳐 단일 배열로 노출 (순서 = 학습 진행 순서).
import type { Mission } from '../types';
import { c0 } from './c0-tutorial';
import { c1 } from './c1-conbini';
import { c2 } from './c2-restaurant';
import { c3 } from './c3-train';
import { c4 } from './c4-hotel';
import { c5 } from './c5-street';
import { c6 } from './c6-pharmacy';
import { c7 } from './c7-shopping';
import { c8 } from './c8-taxi';

export const missions: Mission[] = [c0, c1, c2, c3, c4, c5, c6, c7, c8];
