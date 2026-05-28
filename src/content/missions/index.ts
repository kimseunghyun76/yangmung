// 미션 묶음 — 미션별 파일을 합쳐 단일 배열로 노출 (순서 = 학습 진행 순서).
import type { Mission } from '../types';
import { c0 } from './c0-tutorial';
import { c1 } from './c1-conbini';
import { c2 } from './c2-restaurant';
import { c3 } from './c3-train';

export const missions: Mission[] = [c0, c1, c2, c3];
