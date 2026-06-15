import 'dart:convert';

enum MuscleGroup {
  chest('CHEST', '가슴'),
  back('BACK', '등'),
  legs('LEGS', '하체'),
  shoulders('SHOULDERS', '어깨'),
  arms('ARMS', '팔'),
  core('CORE', '복근');

  const MuscleGroup(this.apiValue, this.label);

  final String apiValue;
  final String label;

  static MuscleGroup fromApiValue(String? value) {
    return MuscleGroup.values.firstWhere(
      (group) => group.apiValue == value,
      orElse: () => MuscleGroup.chest,
    );
  }
}

enum Gender {
  male('MALE', '남'),
  female('FEMALE', '여');

  const Gender(this.apiValue, this.label);

  final String apiValue;
  final String label;

  static Gender fromApiValue(String? value) {
    return Gender.values.firstWhere(
      (gender) => gender.apiValue == value,
      orElse: () => Gender.male,
    );
  }
}

class RepickUser {
  const RepickUser({
    required this.id,
    required this.email,
    required this.nickname,
    required this.displayName,
    required this.gender,
    required this.workoutGoal,
    required this.ageGroup,
  });

  final String id;
  final String email;
  final String nickname;
  final String displayName;
  final Gender gender;
  final String workoutGoal;
  final String ageGroup;

  factory RepickUser.fromJson(Map<String, dynamic> json) {
    return RepickUser(
      id: json['id']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      nickname: json['nickname']?.toString() ?? '',
      displayName:
          json['displayName']?.toString() ?? json['nickname']?.toString() ?? '',
      gender: Gender.fromApiValue(json['gender']?.toString()),
      workoutGoal: json['workoutGoal']?.toString() ?? 'MUSCLE_GAIN',
      ageGroup: json['ageGroup']?.toString() ?? 'AGE_30S',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'nickname': nickname,
      'displayName': displayName,
      'gender': gender.apiValue,
      'workoutGoal': workoutGoal,
      'ageGroup': ageGroup,
    };
  }

  String encode() => jsonEncode(toJson());

  static RepickUser? decode(String? value) {
    if (value == null || value.isEmpty) {
      return null;
    }

    try {
      return RepickUser.fromJson(jsonDecode(value) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }
}

class ExerciseMachine {
  const ExerciseMachine({
    required this.id,
    required this.name,
    required this.muscleGroup,
    required this.muscleGroupLabel,
    required this.movementPattern,
    this.description,
    this.custom = false,
    this.deletable = false,
  });

  final int id;
  final String name;
  final MuscleGroup muscleGroup;
  final String muscleGroupLabel;
  final String movementPattern;
  final String? description;
  final bool custom;
  final bool deletable;

  factory ExerciseMachine.fromJson(Map<String, dynamic> json) {
    final group = MuscleGroup.fromApiValue(json['muscleGroup']?.toString());
    return ExerciseMachine(
      id: int.tryParse(json['id']?.toString() ?? '') ?? 0,
      name: json['name']?.toString() ?? '',
      muscleGroup: group,
      muscleGroupLabel: json['muscleGroupLabel']?.toString() ?? group.label,
      movementPattern: json['movementPattern']?.toString() ?? '',
      description: json['description']?.toString(),
      custom: json['custom'] == true,
      deletable: json['deletable'] == true,
    );
  }
}

class WorkoutSetEntry {
  const WorkoutSetEntry({
    required this.setOrder,
    required this.weightKg,
    required this.reps,
    this.completed = false,
  });

  final int setOrder;
  final num weightKg;
  final int reps;
  final bool completed;

  factory WorkoutSetEntry.fromJson(Map<String, dynamic> json) {
    return WorkoutSetEntry(
      setOrder: int.tryParse(json['setOrder']?.toString() ?? '') ?? 1,
      weightKg: num.tryParse(json['weightKg']?.toString() ?? '') ?? 0,
      reps: int.tryParse(json['reps']?.toString() ?? '') ?? 0,
      completed: json['completed'] == true,
    );
  }

  Map<String, dynamic> toRecordPayload() {
    return {
      'setOrder': setOrder,
      'weightKg': weightKg,
      'reps': reps,
      'completed': completed,
    };
  }
}

class WorkoutRecord {
  const WorkoutRecord({
    required this.id,
    required this.machineId,
    required this.machineName,
    required this.muscleGroupLabel,
    required this.sets,
    this.catalogId,
    this.note,
  });

  final String id;
  final int machineId;
  final String machineName;
  final int? catalogId;
  final String muscleGroupLabel;
  final String? note;
  final List<WorkoutSetEntry> sets;

  factory WorkoutRecord.fromJson(Map<String, dynamic> json) {
    return WorkoutRecord(
      id: json['id']?.toString() ?? json['recordId']?.toString() ?? '',
      machineId:
          int.tryParse(json['machineId']?.toString() ?? '') ??
          int.tryParse(json['catalogId']?.toString() ?? '') ??
          0,
      machineName:
          json['machineName']?.toString() ??
          json['exerciseName']?.toString() ??
          '',
      catalogId: int.tryParse(json['catalogId']?.toString() ?? ''),
      muscleGroupLabel: json['muscleGroupLabel']?.toString() ?? '',
      note: json['note']?.toString(),
      sets: (json['sets'] as List<dynamic>? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(WorkoutSetEntry.fromJson)
          .toList(),
    );
  }
}

class WorkoutSession {
  const WorkoutSession({
    required this.id,
    required this.workoutDate,
    required this.records,
    this.userId,
    this.status = 'IN_PROGRESS',
    this.startedAt,
    this.finishedAt,
    this.durationSeconds,
    this.memo,
  });

  final String id;
  final String? userId;
  final String workoutDate;
  final String status;
  final DateTime? startedAt;
  final DateTime? finishedAt;
  final int? durationSeconds;
  final String? memo;
  final List<WorkoutRecord> records;

  bool get isFinished => status == 'FINISHED';

  factory WorkoutSession.fromJson(Map<String, dynamic> json) {
    return WorkoutSession(
      id: json['id']?.toString() ?? '',
      userId: json['userId']?.toString(),
      workoutDate: json['workoutDate']?.toString() ?? _todayKey(),
      status: json['status']?.toString() ?? 'IN_PROGRESS',
      startedAt: DateTime.tryParse(json['startedAt']?.toString() ?? ''),
      finishedAt: DateTime.tryParse(json['finishedAt']?.toString() ?? ''),
      durationSeconds: int.tryParse(json['durationSeconds']?.toString() ?? ''),
      memo: json['memo']?.toString(),
      records: (json['records'] as List<dynamic>? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(WorkoutRecord.fromJson)
          .toList(),
    );
  }
}

class ShopState {
  const ShopState({
    this.purchasedItemIds = const [],
    this.spentChickenBreasts = 0,
    this.freeChickenBreasts = 0,
    this.equippedCompanionId,
  });

  final List<String> purchasedItemIds;
  final int spentChickenBreasts;
  final int freeChickenBreasts;
  final String? equippedCompanionId;

  ShopState copyWith({
    List<String>? purchasedItemIds,
    int? spentChickenBreasts,
    int? freeChickenBreasts,
    String? equippedCompanionId,
  }) {
    return ShopState(
      purchasedItemIds: purchasedItemIds ?? this.purchasedItemIds,
      spentChickenBreasts: spentChickenBreasts ?? this.spentChickenBreasts,
      freeChickenBreasts: freeChickenBreasts ?? this.freeChickenBreasts,
      equippedCompanionId: equippedCompanionId ?? this.equippedCompanionId,
    );
  }

  bool owns(String itemId) => purchasedItemIds.contains(itemId);

  Map<String, dynamic> toJson() {
    return {
      'purchasedItemIds': purchasedItemIds,
      'spentChickenBreasts': spentChickenBreasts,
      'freeChickenBreasts': freeChickenBreasts,
      'equipped': {
        if (equippedCompanionId != null) 'companion': equippedCompanionId,
      },
    };
  }

  String encode() => jsonEncode(toJson());

  static ShopState decode(String? value) {
    if (value == null || value.isEmpty) {
      return const ShopState();
    }

    try {
      final json = jsonDecode(value) as Map<String, dynamic>;
      final equipped = json['equipped'] is Map<String, dynamic>
          ? json['equipped'] as Map<String, dynamic>
          : <String, dynamic>{};
      return ShopState(
        purchasedItemIds: (json['purchasedItemIds'] as List<dynamic>? ?? [])
            .map((item) => item.toString())
            .toList(),
        spentChickenBreasts:
            int.tryParse(json['spentChickenBreasts']?.toString() ?? '') ?? 0,
        freeChickenBreasts:
            int.tryParse(json['freeChickenBreasts']?.toString() ?? '') ?? 0,
        equippedCompanionId: equipped['companion']?.toString(),
      );
    } catch (_) {
      return const ShopState();
    }
  }
}

String _todayKey() {
  final now = DateTime.now();
  return '${now.year.toString().padLeft(4, '0')}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
}
