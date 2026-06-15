import '../shared/models.dart';

class AvatarCandidate {
  const AvatarCandidate({
    required this.id,
    required this.gender,
    required this.name,
    required this.description,
    required this.assetPath,
    required this.isDefault,
    required this.price,
  });

  final String id;
  final Gender gender;
  final String name;
  final String description;
  final String assetPath;
  final bool isDefault;
  final int price;
}

class ShopItem {
  const ShopItem({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.assetPath,
    required this.category,
    this.gender,
    this.avatarId,
  });

  final String id;
  final String name;
  final String description;
  final int price;
  final String assetPath;
  final String category;
  final Gender? gender;
  final String? avatarId;
}

const avatarCandidates = [
  AvatarCandidate(
    id: 'male-character-1',
    gender: Gender.male,
    name: '캐릭터1',
    description: '민트 티셔츠와 네이비 반바지',
    assetPath: 'assets/avatars/male-character-1.png',
    isDefault: false,
    price: 180,
  ),
  AvatarCandidate(
    id: 'male-character-2',
    gender: Gender.male,
    name: '캐릭터2',
    description: '화이트 티셔츠와 블랙 반바지',
    assetPath: 'assets/avatars/male-character-2.png',
    isDefault: true,
    price: 0,
  ),
  AvatarCandidate(
    id: 'male-character-3',
    gender: Gender.male,
    name: '캐릭터3',
    description: '코랄 티셔츠와 그레이 반바지',
    assetPath: 'assets/avatars/male-character-3.png',
    isDefault: true,
    price: 0,
  ),
  AvatarCandidate(
    id: 'male-character-4',
    gender: Gender.male,
    name: '캐릭터4',
    description: '옐로우 티셔츠와 네이비 반바지',
    assetPath: 'assets/avatars/male-character-4.png',
    isDefault: false,
    price: 220,
  ),
  AvatarCandidate(
    id: 'female-character-1',
    gender: Gender.female,
    name: '캐릭터1',
    description: '민트 티셔츠와 네이비 반바지',
    assetPath: 'assets/avatars/female-character-1.png',
    isDefault: false,
    price: 180,
  ),
  AvatarCandidate(
    id: 'female-character-2',
    gender: Gender.female,
    name: '캐릭터2',
    description: '화이트 티셔츠와 블랙 반바지',
    assetPath: 'assets/avatars/female-character-2.png',
    isDefault: true,
    price: 0,
  ),
  AvatarCandidate(
    id: 'female-character-3',
    gender: Gender.female,
    name: '캐릭터3',
    description: '코랄 티셔츠와 그레이 반바지',
    assetPath: 'assets/avatars/female-character-3.png',
    isDefault: true,
    price: 0,
  ),
  AvatarCandidate(
    id: 'female-character-4',
    gender: Gender.female,
    name: '캐릭터4',
    description: '옐로우 티셔츠와 네이비 반바지',
    assetPath: 'assets/avatars/female-character-4.png',
    isDefault: false,
    price: 220,
  ),
];

const companionItems = [
  ShopItem(
    id: 'cat-brown-1',
    name: '브라운 펫 1',
    description: '복슬복슬한 기본 동행 펫',
    price: 260,
    assetPath: 'assets/companions/cat-brown-1.png',
    category: 'companion',
  ),
  ShopItem(
    id: 'cat-brown-2',
    name: '브라운 펫 2',
    description: '깜짝 놀란 표정의 작은 동행 펫',
    price: 320,
    assetPath: 'assets/companions/cat-brown-2.png',
    category: 'companion',
  ),
  ShopItem(
    id: 'cat-brown-3',
    name: '브라운 펫 3',
    description: '활발하게 움직이는 한정 펫',
    price: 360,
    assetPath: 'assets/companions/cat-brown-3.png',
    category: 'companion',
  ),
];

List<ShopItem> avatarShopItemsFor(Gender gender) {
  return avatarCandidates
      .where((avatar) => avatar.gender == gender && !avatar.isDefault)
      .map(
        (avatar) => ShopItem(
          id: 'avatar-${avatar.id}',
          name: '${gender.label} ${avatar.name}',
          description: avatar.description,
          price: avatar.price,
          assetPath: avatar.assetPath,
          category: 'avatar',
          gender: gender,
          avatarId: avatar.id,
        ),
      )
      .toList();
}

List<ExerciseMachine> fallbackExercises() {
  const seeds = [
    ('체스트 프레스', MuscleGroup.chest, 'Push', '가슴 전면을 안정적으로 밀어내는 머신'),
    ('펙덱 플라이', MuscleGroup.chest, 'Fly', '가슴 수축 감각을 기록하기 좋은 머신'),
    ('인클라인 체스트 프레스', MuscleGroup.chest, 'Incline Push', '윗가슴을 함께 쓰는 프레스'),
    ('덤벨 벤치프레스', MuscleGroup.chest, 'Free Push', '좌우 밸런스를 확인하는 운동'),
    ('랫풀다운', MuscleGroup.back, 'Pull', '광배근 중심의 수직 당기기 운동'),
    ('시티드 로우', MuscleGroup.back, 'Row', '등 중앙부를 쓰는 머신'),
    ('어시스트 풀업', MuscleGroup.back, 'Vertical Pull', '풀업 패턴을 연습하는 운동'),
    ('레그 프레스', MuscleGroup.legs, 'Push', '고중량 하체 기록에 적합한 머신'),
    ('레그 컬', MuscleGroup.legs, 'Curl', '햄스트링 고립 운동'),
    ('스쿼트', MuscleGroup.legs, 'Squat', '하체 전반과 코어 안정성을 쓰는 운동'),
    ('숄더 프레스', MuscleGroup.shoulders, 'Push', '어깨 전면과 측면을 쓰는 머신'),
    ('레터럴 레이즈 머신', MuscleGroup.shoulders, 'Raise', '측면 삼각근 고립 운동'),
    ('리어 델트 플라이', MuscleGroup.shoulders, 'Rear Fly', '후면 삼각근 운동'),
    ('트라이셉스 푸쉬다운', MuscleGroup.arms, 'Pushdown', '삼두근 고립 운동'),
    ('바이셉스 컬', MuscleGroup.arms, 'Curl', '이두근 수축을 기록하는 운동'),
    ('케이블 크런치', MuscleGroup.core, 'Crunch', '복직근 수축 운동'),
    ('플랭크', MuscleGroup.core, 'Hold', '코어 안정성을 기르는 운동'),
  ];

  return [
    for (var index = 0; index < seeds.length; index++)
      ExerciseMachine(
        id: index + 1,
        name: seeds[index].$1,
        muscleGroup: seeds[index].$2,
        muscleGroupLabel: seeds[index].$2.label,
        movementPattern: seeds[index].$3,
        description: seeds[index].$4,
      ),
  ];
}

class ExerciseAssetRule {
  const ExerciseAssetRule({required this.keywords, required this.assetPath});

  final List<String> keywords;
  final String assetPath;
}

const exerciseAssetRules = [
  ExerciseAssetRule(
    keywords: ['인클라인', 'incline'],
    assetPath: 'assets/exercises/incline-press-anatomy.png',
  ),
  ExerciseAssetRule(
    keywords: ['플라이', '펙덱', '크로스오버', 'fly', 'pec deck', 'crossover'],
    assetPath: 'assets/exercises/chest-fly-anatomy.png',
  ),
  ExerciseAssetRule(
    keywords: [
      '벤치',
      '체스트 프레스',
      '디클라인',
      '푸쉬업',
      '푸시업',
      '딥스',
      'bench',
      'chest press',
      'push up',
      'pushup',
      'dip',
    ],
    assetPath: 'assets/exercises/bench-press-anatomy.png',
  ),
  ExerciseAssetRule(
    keywords: [
      '랫풀',
      '풀다운',
      '풀업',
      '스트레이트 암',
      '풀오버',
      'lat',
      'pulldown',
      'pullup',
      'pull up',
      'pullover',
    ],
    assetPath: 'assets/exercises/lat-pulldown-anatomy.png',
  ),
  ExerciseAssetRule(
    keywords: [
      '시티드 로우',
      '티바 로우',
      '덤벨 로우',
      '하이 로우',
      '로우 머신',
      'seated row',
      't-bar',
      'tbar',
      'dumbbell row',
      'high row',
    ],
    assetPath: 'assets/exercises/seated-row-anatomy.png',
  ),
  ExerciseAssetRule(
    keywords: [
      '데드리프트',
      '루마니안',
      '백 익스텐션',
      'deadlift',
      'romanian',
      'back extension',
    ],
    assetPath: 'assets/exercises/deadlift-anatomy.png',
  ),
  ExerciseAssetRule(
    keywords: ['레그 프레스', 'leg press'],
    assetPath: 'assets/exercises/leg-press-anatomy.png',
  ),
  ExerciseAssetRule(
    keywords: ['레그 익스텐션', 'leg extension'],
    assetPath: 'assets/exercises/leg-extension-anatomy.png',
  ),
  ExerciseAssetRule(
    keywords: ['레그 컬', 'leg curl'],
    assetPath: 'assets/exercises/leg-curl-anatomy.png',
  ),
  ExerciseAssetRule(
    keywords: ['힙 쓰러스트', '힙 어브덕션', 'hip thrust', 'abduction'],
    assetPath: 'assets/exercises/hip-thrust-anatomy.png',
  ),
  ExerciseAssetRule(
    keywords: ['카프', 'calf'],
    assetPath: 'assets/exercises/calf-raise-anatomy.png',
  ),
  ExerciseAssetRule(
    keywords: ['스쿼트', '런지', 'squat', 'lunge'],
    assetPath: 'assets/exercises/squat-anatomy.png',
  ),
  ExerciseAssetRule(
    keywords: [
      '숄더 프레스',
      '오버헤드프레스',
      '오버헤드 프레스',
      'shoulder press',
      'overhead press',
    ],
    assetPath: 'assets/exercises/shoulder-press-anatomy.png',
  ),
  ExerciseAssetRule(
    keywords: ['리어 델트', '페이스 풀', 'rear delt', 'face pull'],
    assetPath: 'assets/exercises/rear-delt-fly-anatomy.png',
  ),
  ExerciseAssetRule(
    keywords: [
      '레터럴',
      '숄더 레이즈',
      '업라이트',
      '프론트 레이즈',
      'lateral',
      'upright row',
      'front raise',
    ],
    assetPath: 'assets/exercises/lateral-raise-anatomy.png',
  ),
  ExerciseAssetRule(
    keywords: [
      '푸시다운',
      '트라이셉스',
      '스컬 크러셔',
      'triceps',
      'pushdown',
      'skull crusher',
    ],
    assetPath: 'assets/exercises/triceps-pushdown-anatomy.png',
  ),
  ExerciseAssetRule(
    keywords: [
      '암 컬',
      '덤벨 컬',
      '해머 컬',
      '프리처 컬',
      '로프 컬',
      '리버스 컬',
      'biceps',
      'curl',
      'hammer curl',
      'preacher curl',
    ],
    assetPath: 'assets/exercises/biceps-curl-anatomy.png',
  ),
  ExerciseAssetRule(
    keywords: ['크런치', '토르소', '팔로프', 'crunch', 'torso', 'pallof'],
    assetPath: 'assets/exercises/cable-crunch-anatomy.png',
  ),
  ExerciseAssetRule(
    keywords: [
      '플랭크',
      '레그레이즈',
      '데드버그',
      '롤아웃',
      '마운틴 클라이머',
      'plank',
      'leg raise',
      'dead bug',
      'rollout',
      'mountain climber',
    ],
    assetPath: 'assets/exercises/plank-anatomy.png',
  ),
];

String? getExerciseAssetPath(String name) {
  final normalizedName = name.toLowerCase();
  final compactName = normalizedName.replaceAll(RegExp(r'\s+'), '');

  for (final rule in exerciseAssetRules) {
    for (final keyword in rule.keywords) {
      final normalizedKeyword = keyword.toLowerCase();
      final compactKeyword = normalizedKeyword.replaceAll(RegExp(r'\s+'), '');
      if (normalizedName.contains(normalizedKeyword) ||
          compactName.contains(compactKeyword)) {
        return rule.assetPath;
      }
    }
  }

  return null;
}
