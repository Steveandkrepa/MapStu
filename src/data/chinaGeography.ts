/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GeoPoint {
  id: string;
  title: string;
  content: string;
  type: 'concept' | 'fact' | 'exam_tip';
  visualUrl?: string;
  animationSteps?: string[];
  mapFocus?: { x: number; y: number; zoom: number };
}

export interface RegionData {
  id: string;
  name: string;
  pinyin?: string;
  capital?: string;
  characteristics: string[];
  climateType: string;
  topography: string;
}

export interface ExamQuestion {
  id: string;
  question: string;
  answer: string;
  analysis: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface Chapter {
  id: string;
  title: string;
  points: GeoPoint[];
  questions?: ExamQuestion[];
}

export const CHINA_GEOGRAPHY_CHAPTERS: Chapter[] = [
  {
    id: 'admin-pop',
    title: '中国疆域、行政区划与人口',
    points: [
      {
        id: 'location',
        title: '地理位置',
        content: '半球位置：东半球、北半球。纬度位置：大部分位于北温带，小部分热带，无寒带。海陆位置：亚欧大陆东部，太平洋西岸。',
        type: 'concept',
        mapFocus: { x: 400, y: 300, zoom: 1 }
      },
      {
        id: 'size',
        title: '领土规模',
        content: '陆地面积约960万平方千米，居世界第三位。领海面积约300万平方千米。',
        type: 'fact'
      },
      {
        id: 'provinces',
        title: '行政区划',
        content: '全国共有34个省级行政单位：23个省、5个自治区、4个直辖市、2个特别行政区。',
        type: 'fact'
      }
    ],
    questions: [
      {
        id: 'q1',
        question: '简述我国地理位置的优越性。',
        answer: '1. 纬度跨度大，气候多样，利于多种农业经营；2. 海陆兼备，东部多雨润，利于农业，西部深入内陆，利于陆路交通；3. 漫长的海岸线，利于发展海洋事业和对外贸易。',
        analysis: '应从纬度位置（热量）、海陆位置（水分与交通便利性）等维度综合分析对自然环境和经济活动的影响。',
        difficulty: 'medium',
        tags: ['地理位置', '综合分析']
      }
    ]
  },
  {
    id: 'topography',
    title: '中国地势与地形',
    points: [
      {
        id: 'stepped-terrain',
        title: '三级阶梯地势',
        content: '地势西高东低，呈三级阶梯状分布。第一级：青藏高原（海拔4000m以上）；第二级：高原与盆地（1000-2000m）；第三级：平原与丘陵（500m以下）。',
        type: 'concept',
        visualUrl: 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&q=80&w=800',
        animationSteps: ['板块挤压抬升', '地势梯级形成', '大河由此东流'],
        mapFocus: { x: 200, y: 350, zoom: 2 }
      },
      {
        id: 'major-features',
        title: '四大高原与四大盆地',
        content: '高原：青藏高原（高寒）、内蒙古高原（平坦）、黄土高原（千沟万壑）、云贵高原（崎岖）。盆地：塔里木、准噶尔、柴达木、四川。',
        type: 'fact',
        visualUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800'
      }
    ],
    questions: [
      {
        id: 'q2',
        question: '分析地势西高东低对我国自然环境和经济发展的影响。',
        answer: '1. 气候：利于海洋湿润气流深入内陆，带来降水；2. 河流：使大河东流，沟通东西交通，阶梯交界处落差大，水能丰富；3. 农业：东部平原广阔，利于耕作业。',
        analysis: '这是高考地理地形专题的经典考题，需要考生建立地形-气候-河流-人类活动的逻辑关联（综合思维）。',
        difficulty: 'hard',
        tags: ['地貌影响', '因果分析']
      }
    ]
  },
  {
    id: 'climate',
    title: '中国气候',
    points: [
      {
        id: 'monsoon',
        title: '季风气候显著',
        content: '显著的季风气候是主要特征。冬季盛行偏北风（寒冷干燥），夏季盛行偏南风（暖热多雨）。',
        type: 'concept'
      },
      {
        id: 'temp-zones',
        title: '温度带划分',
        content: '由南向北划分为：赤道带、热带、亚热带、暖温带、中温带、寒温带。另有高原气候区。',
        type: 'fact'
      }
    ]
  },
  {
    id: 'rivers',
    title: '中国河流与湖泊',
    points: [
      {
        id: 'yangtze',
        title: '长江',
        content: '全长6300km，中国第一大河。发源于各拉丹冬，注入东海。被称为“水能宝库”和“黄金水道”。',
        type: 'fact',
        mapFocus: { x: 500, y: 380, zoom: 1.5 }
      },
      {
        id: 'yellow-river',
        title: '黄河',
        content: '全长5464km，中国第二长河。呈“几”字型。发源于巴颜喀拉山，注入渤海。上游多水能，中游多泥沙，下游“地上河”。',
        type: 'fact'
      }
    ]
  }
];

export const PROVINCE_DATA: Record<string, RegionData> = {
  'Hubei': {
    id: 'HB',
    name: '湖北省',
    pinyin: 'Hubei',
    capital: '武汉',
    characteristics: ['千湖之省', '江汉平原核心', '九省通衢'],
    climateType: '亚热带季风气候',
    topography: '江汉平原、鄂西大巴山脉'
  },
  // Add other provinces as needed
};
