import 'dart:async';
import 'dart:math';
import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:share_plus/share_plus.dart';

import '../core/api_client.dart';
import '../core/local_store.dart';
import '../data/repick_catalog.dart';
import '../shared/models.dart';
import 'app_theme.dart';

const _shopTabEnabled = false;

class RepickApp extends StatefulWidget {
  const RepickApp({super.key});

  @override
  State<RepickApp> createState() => _RepickAppState();
}

class _RepickAppState extends State<RepickApp> {
  final _api = ApiClient();
  final _store = LocalStore();
  RepickUser? _user;
  var _checkingSession = true;

  @override
  void initState() {
    super.initState();
    _loadSession();
  }

  Future<void> _loadSession() async {
    final user = await _store.loadUser();
    if (!mounted) {
      return;
    }
    setState(() {
      _user = user;
      _checkingSession = false;
    });
  }

  Future<void> _handleLogin(RepickUser user) async {
    await _store.saveUser(user);
    await _store.saveLastLoginEmail(user.email);
    if (!mounted) {
      return;
    }
    setState(() => _user = user);
  }

  Future<void> _logout() async {
    await _store.clearUser();
    if (!mounted) {
      return;
    }
    setState(() => _user = null);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Repick',
      debugShowCheckedModeBanner: false,
      theme: buildRepickTheme(),
      builder: (context, child) {
        return GestureDetector(
          behavior: HitTestBehavior.translucent,
          onTap: () => FocusManager.instance.primaryFocus?.unfocus(),
          child: child ?? const SizedBox.shrink(),
        );
      },
      home: _checkingSession
          ? const _LoadingScreen()
          : _user == null
          ? AuthScreen(api: _api, store: _store, onLogin: _handleLogin)
          : RepickShell(
              api: _api,
              store: _store,
              user: _user!,
              onLogout: _logout,
            ),
    );
  }
}

class _LoadingScreen extends StatelessWidget {
  const _LoadingScreen();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: Center(child: CircularProgressIndicator()));
  }
}

class AuthScreen extends StatefulWidget {
  const AuthScreen({
    required this.api,
    required this.store,
    required this.onLogin,
    super.key,
  });

  final ApiClient api;
  final LocalStore store;
  final ValueChanged<RepickUser> onLogin;

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _nicknameController = TextEditingController();
  var _registerMode = false;
  var _gender = Gender.male;
  var _workoutGoal = 'MUSCLE_GAIN';
  var _ageGroup = 'AGE_30S';
  var _submitting = false;
  String? _lastLoginEmail;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadLastLoginEmail();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _nicknameController.dispose();
    super.dispose();
  }

  Future<void> _loadLastLoginEmail() async {
    final email = await widget.store.loadLastLoginEmail();
    if (!mounted || email == null || email.isEmpty) {
      return;
    }

    setState(() {
      _lastLoginEmail = email;
      if (_emailController.text.trim().isEmpty) {
        _emailController.text = email;
      }
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _submitting = true;
      _error = null;
    });

    try {
      final user = _registerMode
          ? await widget.api.register(
              email: _emailController.text.trim(),
              password: _passwordController.text,
              nickname: _nicknameController.text.trim(),
              gender: _gender,
              workoutGoal: _workoutGoal,
              ageGroup: _ageGroup,
            )
          : await widget.api.login(
              email: _emailController.text.trim(),
              password: _passwordController.text,
            );
      await widget.store.saveLastLoginEmail(_emailController.text);
      widget.onLogin(user);
    } catch (error) {
      setState(() => _error = error.toString());
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
          children: [
            Row(
              children: [
                const Text(
                  'Repick',
                  style: TextStyle(
                    color: RepickColors.blue,
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const Spacer(),
                SegmentedButton<bool>(
                  segments: const [
                    ButtonSegment(value: false, label: Text('로그인')),
                    ButtonSegment(value: true, label: Text('가입')),
                  ],
                  selected: {_registerMode},
                  onSelectionChanged: (values) => setState(() {
                    _registerMode = values.first;
                    _error = null;
                  }),
                ),
              ],
            ),
            const SizedBox(height: 28),
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: RepickColors.line),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          '캐릭터를\n키워보시겠어요?',
                          style: TextStyle(
                            color: RepickColors.navy,
                            fontSize: 30,
                            height: 1.1,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          '운동 기록으로 닭가슴살을 모으고 캐릭터와 펫을 꾸며요.',
                          style: TextStyle(
                            color: Colors.grey.shade700,
                            height: 1.35,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  SizedBox(
                    width: 118,
                    child: Stack(
                      clipBehavior: Clip.none,
                      children: [
                        Image.asset('assets/avatars/male-character-2.png'),
                        Positioned(
                          right: -4,
                          bottom: 4,
                          child: Image.asset(
                            'assets/companions/cat-brown-2.png',
                            width: 54,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),
            AutofillGroup(
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    if (_lastLoginEmail != null &&
                        _lastLoginEmail!.isNotEmpty) ...[
                      Align(
                        alignment: Alignment.centerLeft,
                        child: TextButton.icon(
                          onPressed: () => setState(
                            () => _emailController.text = _lastLoginEmail!,
                          ),
                          icon: const Icon(Icons.mail_outline),
                          label: const Text('최근 이메일 사용'),
                        ),
                      ),
                      const SizedBox(height: 4),
                    ],
                    TextFormField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      autofillHints: const [
                        AutofillHints.username,
                        AutofillHints.email,
                      ],
                      textInputAction: TextInputAction.next,
                      decoration: const InputDecoration(labelText: '아이디 (이메일)'),
                      validator: (value) =>
                          value == null || !value.contains('@')
                          ? '이메일을 입력해주세요.'
                          : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _passwordController,
                      obscureText: true,
                      autofillHints: const [AutofillHints.password],
                      textInputAction: TextInputAction.done,
                      onFieldSubmitted: (_) {
                        if (!_registerMode) {
                          _submit();
                        }
                      },
                      decoration: const InputDecoration(labelText: '비밀번호'),
                      validator: (value) => value == null || value.length < 8
                          ? '8자 이상 입력해주세요.'
                          : null,
                    ),
                    if (_registerMode) ...[
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _nicknameController,
                        textInputAction: TextInputAction.next,
                        decoration: const InputDecoration(labelText: '닉네임'),
                        validator: (value) =>
                            value == null || value.trim().length < 2
                            ? '2자 이상 입력해주세요.'
                            : null,
                      ),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        initialValue: _workoutGoal,
                        decoration: const InputDecoration(labelText: '운동목적'),
                        items: const [
                          DropdownMenuItem(value: 'DIET', child: Text('다이어트')),
                          DropdownMenuItem(
                            value: 'MUSCLE_GAIN',
                            child: Text('근비대'),
                          ),
                          DropdownMenuItem(value: 'HEALTH', child: Text('건강')),
                        ],
                        onChanged: (value) => setState(
                          () => _workoutGoal = value ?? _workoutGoal,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: DropdownButtonFormField<Gender>(
                              initialValue: _gender,
                              decoration: const InputDecoration(
                                labelText: '성별',
                              ),
                              items: Gender.values
                                  .map(
                                    (gender) => DropdownMenuItem(
                                      value: gender,
                                      child: Text(gender.label),
                                    ),
                                  )
                                  .toList(),
                              onChanged: (value) =>
                                  setState(() => _gender = value ?? _gender),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              initialValue: _ageGroup,
                              decoration: const InputDecoration(
                                labelText: '연령대',
                              ),
                              items: const [
                                DropdownMenuItem(
                                  value: 'AGE_10S',
                                  child: Text('10대'),
                                ),
                                DropdownMenuItem(
                                  value: 'AGE_20S',
                                  child: Text('20대'),
                                ),
                                DropdownMenuItem(
                                  value: 'AGE_30S',
                                  child: Text('30대'),
                                ),
                                DropdownMenuItem(
                                  value: 'AGE_40S',
                                  child: Text('40대'),
                                ),
                                DropdownMenuItem(
                                  value: 'AGE_50S',
                                  child: Text('50대'),
                                ),
                                DropdownMenuItem(
                                  value: 'AGE_60S',
                                  child: Text('60대'),
                                ),
                                DropdownMenuItem(
                                  value: 'AGE_70S',
                                  child: Text('70대'),
                                ),
                                DropdownMenuItem(
                                  value: 'AGE_80S',
                                  child: Text('80대'),
                                ),
                                DropdownMenuItem(
                                  value: 'AGE_90S',
                                  child: Text('90대'),
                                ),
                              ],
                              onChanged: (value) => setState(
                                () => _ageGroup = value ?? _ageGroup,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                    const SizedBox(height: 18),
                    if (_error != null)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Text(
                          _error!,
                          style: const TextStyle(color: Colors.redAccent),
                        ),
                      ),
                    FilledButton(
                      onPressed: _submitting ? null : _submit,
                      child: _submitting
                          ? const SizedBox.square(
                              dimension: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : Text(_registerMode ? '캐릭터 키우기 시작' : '로그인'),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class RepickShell extends StatefulWidget {
  const RepickShell({
    required this.api,
    required this.store,
    required this.user,
    required this.onLogout,
    super.key,
  });

  final ApiClient api;
  final LocalStore store;
  final RepickUser user;
  final VoidCallback onLogout;

  @override
  State<RepickShell> createState() => _RepickShellState();
}

class _RepickShellState extends State<RepickShell> {
  var _tabIndex = 0;
  var _selectedGroup = MuscleGroup.chest;
  var _exercises = fallbackExercises();
  var _sessions = <WorkoutSession>[];
  var _loading = true;
  String? _selectedAvatarId;
  var _shopState = const ShopState();

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final storedAvatar = await widget.store.loadAvatarId(widget.user.id);
    final shopState = await widget.store.loadShopState(widget.user.id);
    final defaults = avatarCandidates.where(
      (avatar) => avatar.gender == widget.user.gender && avatar.isDefault,
    );
    final avatarId = storedAvatar ?? defaults.first.id;
    if (storedAvatar == null) {
      await widget.store.saveAvatarId(widget.user.id, avatarId);
    }

    var exercises = fallbackExercises();
    var sessions = <WorkoutSession>[];

    try {
      final loadedExercises = await widget.api.listExercises(widget.user.id);
      if (loadedExercises.isNotEmpty) {
        exercises = loadedExercises;
      }
    } catch (_) {
      exercises = fallbackExercises();
    }

    try {
      sessions = await widget.api.listWorkoutSessions(widget.user.id);
    } catch (_) {
      sessions = [];
    }

    if (!mounted) {
      return;
    }
    setState(() {
      _selectedAvatarId = avatarId;
      _shopState = shopState;
      _exercises = exercises;
      _sessions = sessions;
      _loading = false;
    });
  }

  Future<void> _refreshSessionsFromApi() async {
    try {
      final sessions = await widget.api.listWorkoutSessions(widget.user.id);
      if (!mounted) {
        return;
      }
      setState(() => _sessions = sessions);
    } catch (_) {
      // Keep the optimistic local state when the server refresh is unavailable.
    }
  }

  WorkoutSession? get _activeSession {
    for (final session in _sessions) {
      if (session.status == 'IN_PROGRESS') {
        return session;
      }
    }
    return null;
  }

  AvatarCandidate get _selectedAvatar {
    final userAvatars = avatarCandidates.where(
      (avatar) => avatar.gender == widget.user.gender,
    );
    return userAvatars.firstWhere(
      (avatar) => avatar.id == _selectedAvatarId,
      orElse: () => userAvatars.firstWhere((avatar) => avatar.isDefault),
    );
  }

  ShopItem? get _equippedCompanion {
    final companionId = _shopState.equippedCompanionId;
    if (companionId == null) {
      return null;
    }
    return companionItems.where((item) => item.id == companionId).firstOrNull;
  }

  int get _completedSessionCount =>
      _sessions.where((session) => session.isFinished).length;

  int get _totalSavedSets => _sessions.fold(
    0,
    (total, session) =>
        total +
        session.records.fold(
          0,
          (subtotal, record) => subtotal + record.sets.length,
        ),
  );

  Set<String> get _trainedDates =>
      _sessions.map((session) => session.workoutDate).toSet();

  int get _earnedChickenBreasts =>
      (_completedSessionCount * 5 +
              _totalSavedSets * 2 +
              _trainedDates.length * 8)
          .round();

  int get _grantedChickenBreasts =>
      widget.user.email.toLowerCase() == 'sasca37@naver.com' ? 100000 : 0;

  int get _chickenBalance => max(
    0,
    _earnedChickenBreasts +
        _grantedChickenBreasts +
        _shopState.freeChickenBreasts -
        _shopState.spentChickenBreasts,
  );

  double get _totalVolume {
    return _sessions.fold(0, (total, session) {
      return total +
          session.records.fold(0, (recordTotal, record) {
            return recordTotal +
                record.sets.fold(
                  0,
                  (setTotal, set) => setTotal + set.weightKg * set.reps,
                );
          });
    });
  }

  int get _level {
    final exp =
        (_totalSavedSets * 34 + _trainedDates.length * 120 + _totalVolume / 90)
            .round();
    return max(1, sqrt(exp / 80).floor() + 1);
  }

  int get _activityTabIndex => _shopTabEnabled ? 4 : 3;

  Future<void> _saveShopState(ShopState state) async {
    await widget.store.saveShopState(widget.user.id, state);
    setState(() => _shopState = state);
  }

  Future<void> _chooseAvatar(String avatarId) async {
    await widget.store.saveAvatarId(widget.user.id, avatarId);
    setState(() => _selectedAvatarId = avatarId);
  }

  Future<WorkoutSession> _startWorkout() async {
    final current = _activeSession;
    if (current != null) {
      return current;
    }

    final local = WorkoutSession(
      id: 'local-draft-${DateTime.now().millisecondsSinceEpoch}',
      userId: widget.user.id,
      workoutDate: _todayKey(),
      startedAt: DateTime.now(),
      records: const [],
    );
    setState(() => _sessions = [local, ..._sessions]);
    return local;
  }

  Future<WorkoutSession> _ensureSession() async {
    final current = _activeSession;
    if (current != null && !current.id.startsWith('local-')) {
      return current;
    }

    try {
      final started = await widget.api.startWorkoutSession(
        widget.user.id,
        _todayKey(),
      );
      setState(
        () => _sessions = [
          started,
          ..._sessions.where(
            (session) => session.id != started.id && session.id != current?.id,
          ),
        ],
      );
      return started;
    } catch (_) {
      if (current != null) {
        return current;
      }

      final local = WorkoutSession(
        id: 'local-${DateTime.now().millisecondsSinceEpoch}',
        userId: widget.user.id,
        workoutDate: _todayKey(),
        startedAt: DateTime.now(),
        records: const [],
      );
      setState(() => _sessions = [local, ..._sessions]);
      return local;
    }
  }

  Future<void> _addRecord(
    ExerciseMachine exercise,
    List<WorkoutSetEntry> sets,
    String? note,
  ) async {
    final session = await _ensureSession();
    if (!session.id.startsWith('local-')) {
      try {
        final updated = await widget.api.addWorkoutRecord(
          userId: widget.user.id,
          sessionId: session.id,
          catalogId: exercise.id,
          sets: sets,
          note: note,
        );
        setState(() {
          _sessions = _sessions
              .map((item) => item.id == updated.id ? updated : item)
              .toList();
        });
        return;
      } catch (error) {
        if (mounted) {
          _showSnack('서버 저장 실패로 로컬 기록에 임시 저장했어요.');
        }
      }
    }

    final record = WorkoutRecord(
      id: 'local-record-${DateTime.now().millisecondsSinceEpoch}',
      machineId: exercise.id,
      machineName: exercise.name,
      catalogId: exercise.id,
      muscleGroupLabel: exercise.muscleGroupLabel,
      note: note,
      sets: sets,
    );

    setState(() {
      _sessions = _sessions.map((item) {
        if (item.id != session.id) {
          return item;
        }
        return WorkoutSession(
          id: item.id,
          userId: item.userId,
          workoutDate: item.workoutDate,
          status: item.status,
          startedAt: item.startedAt,
          finishedAt: item.finishedAt,
          durationSeconds: item.durationSeconds,
          memo: item.memo,
          records: [...item.records, record],
        );
      }).toList();
    });
  }

  Future<void> _finishWorkout() async {
    final session = _activeSession;
    if (session == null) {
      _showSnack('진행 중인 운동이 없습니다.');
      return;
    }
    if (session.records.isEmpty) {
      if (!session.id.startsWith('local-')) {
        try {
          await widget.api.deleteWorkoutSession(widget.user.id, session.id);
        } catch (error) {
          _showSnack('빈 운동 종료 처리에 실패했어요. ${error.toString()}');
          return;
        }
      }

      setState(() {
        _sessions = _sessions.where((item) => item.id != session.id).toList();
      });
      _showSnack('저장할 운동 없이 종료했어요.');
      return;
    }

    if (!session.id.startsWith('local-')) {
      try {
        final finished = await widget.api.finishWorkoutSession(
          widget.user.id,
          session.id,
        );
        setState(() {
          _sessions = _sessions
              .map((item) => item.id == finished.id ? finished : item)
              .toList();
          _tabIndex = _activityTabIndex;
        });
        await _refreshSessionsFromApi();
        _showSnack('운동 완료! 닭가슴살 보상이 반영됐어요.');
        return;
      } catch (error) {
        _showSnack(error.toString());
        return;
      }
    }

    final now = DateTime.now();
    final durationSeconds = max(
      1,
      now.difference(session.startedAt ?? now).inSeconds,
    );
    setState(() {
      _sessions = _sessions.map((item) {
        if (item.id != session.id) {
          return item;
        }
        return WorkoutSession(
          id: item.id,
          userId: item.userId,
          workoutDate: item.workoutDate,
          status: 'FINISHED',
          startedAt: item.startedAt,
          finishedAt: now,
          durationSeconds: durationSeconds,
          memo: item.memo,
          records: item.records,
        );
      }).toList();
      _tabIndex = _activityTabIndex;
    });
    _showSnack('운동 완료! 로컬 기록에 저장했어요.');
  }

  Future<void> _deleteWorkoutSession(WorkoutSession session) async {
    if (!session.id.startsWith('local-')) {
      try {
        await widget.api.deleteWorkoutSession(widget.user.id, session.id);
      } catch (error) {
        _showSnack(error.toString());
        return;
      }
    }

    setState(() {
      _sessions = _sessions.where((item) => item.id != session.id).toList();
    });
    _showSnack('운동 세션을 삭제했어요.');
  }

  void _showSnack(String message) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      _HomeTab(
        user: widget.user,
        avatar: _selectedAvatar,
        companion: _equippedCompanion,
        level: _level,
        chickenBalance: _chickenBalance,
        completedSessions: _completedSessionCount,
        totalSets: _totalSavedSets,
        totalVolume: _totalVolume,
        onAvatarTap: () => _showAvatarPicker(context),
        onGoRecord: () => setState(() => _tabIndex = 1),
      ),
      _WorkoutTab(
        activeSession: _activeSession,
        onStart: _startWorkout,
        onFinish: _finishWorkout,
        onOpenExercisePicker: () => _showExercisePickerSheet(context),
      ),
      const _OneRmTab(),
      if (_shopTabEnabled)
        _ShopTab(
          user: widget.user,
          shopState: _shopState,
          balance: _chickenBalance,
          selectedAvatarId: _selectedAvatarId,
          onFreeChicken: () => _saveShopState(
            _shopState.copyWith(
              freeChickenBreasts: _shopState.freeChickenBreasts + 1000,
            ),
          ),
          onBuy: _buyShopItem,
          onEquipAvatar: _chooseAvatar,
          onEquipCompanion: (itemId) =>
              _saveShopState(_shopState.copyWith(equippedCompanionId: itemId)),
        ),
      _ActivityTab(sessions: _sessions, onDeleteSession: _deleteWorkoutSession),
    ];
    final selectedIndex = min(_tabIndex, pages.length - 1);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Repick',
          style: TextStyle(
            color: RepickColors.blue,
            fontWeight: FontWeight.w900,
          ),
        ),
        actions: [
          IconButton(
            tooltip: '로그아웃',
            onPressed: widget.onLogout,
            icon: const Icon(Icons.logout_rounded),
          ),
        ],
      ),
      body: SafeArea(child: pages[selectedIndex]),
      bottomNavigationBar: NavigationBar(
        selectedIndex: selectedIndex,
        onDestinationSelected: (index) => setState(() => _tabIndex = index),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: '홈',
          ),
          NavigationDestination(
            icon: Icon(Icons.fitness_center_outlined),
            selectedIcon: Icon(Icons.fitness_center),
            label: '기록',
          ),
          NavigationDestination(
            icon: Icon(Icons.calculate_outlined),
            selectedIcon: Icon(Icons.calculate),
            label: '1RM',
          ),
          if (_shopTabEnabled)
            NavigationDestination(
              icon: Icon(Icons.storefront_outlined),
              selectedIcon: Icon(Icons.storefront),
              label: '상점',
            ),
          NavigationDestination(
            icon: Icon(Icons.calendar_month_outlined),
            selectedIcon: Icon(Icons.calendar_month),
            label: '활동',
          ),
        ],
      ),
    );
  }

  Future<void> _buyShopItem(ShopItem item) async {
    if (_shopState.owns(item.id)) {
      if (item.avatarId != null) {
        await _chooseAvatar(item.avatarId!);
      } else if (item.category == 'companion') {
        await _saveShopState(_shopState.copyWith(equippedCompanionId: item.id));
      }
      return;
    }
    if (_chickenBalance < item.price) {
      _showSnack('닭가슴살이 부족합니다.');
      return;
    }

    final next = _shopState.copyWith(
      purchasedItemIds: [..._shopState.purchasedItemIds, item.id],
      spentChickenBreasts: _shopState.spentChickenBreasts + item.price,
      equippedCompanionId: item.category == 'companion'
          ? item.id
          : _shopState.equippedCompanionId,
    );
    await _saveShopState(next);
    if (item.avatarId != null) {
      await _chooseAvatar(item.avatarId!);
    }
  }

  Future<void> _showAvatarPicker(BuildContext context) async {
    final avatars = avatarCandidates
        .where((avatar) => avatar.gender == widget.user.gender)
        .toList();
    await showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (context) {
        return SafeArea(
          child: GridView.count(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            crossAxisCount: 2,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 0.78,
            children: [
              for (final avatar in avatars)
                _AvatarOptionCard(
                  avatar: avatar,
                  selected: avatar.id == _selectedAvatarId,
                  unlocked:
                      avatar.isDefault ||
                      _shopState.owns('avatar-${avatar.id}'),
                  onTap: () {
                    if (avatar.isDefault ||
                        _shopState.owns('avatar-${avatar.id}')) {
                      _chooseAvatar(avatar.id);
                      Navigator.pop(context);
                    } else {
                      Navigator.pop(context);
                      _showSnack('상점은 추후 고도화 예정입니다.');
                    }
                  },
                ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _showExercisePickerSheet(BuildContext context) async {
    final exercise = await showModalBottomSheet<ExerciseMachine>(
      context: context,
      enableDrag: false,
      isScrollControlled: true,
      showDragHandle: false,
      useSafeArea: true,
      builder: (context) => _ExercisePickerSheet(
        loading: _loading,
        exercises: _exercises,
        selectedGroup: _selectedGroup,
        sessions: _sessions,
      ),
    );

    if (exercise == null || !context.mounted) {
      return;
    }

    setState(() => _selectedGroup = exercise.muscleGroup);
    await _showAddRecordSheet(context, exercise);
  }

  Future<void> _showAddRecordSheet(
    BuildContext context,
    ExerciseMachine exercise,
  ) async {
    final result = await showModalBottomSheet<_RecordDraft>(
      context: context,
      enableDrag: false,
      isScrollControlled: true,
      showDragHandle: false,
      useSafeArea: true,
      builder: (context) => _AddRecordSheet(exercise: exercise),
    );

    if (result == null) {
      return;
    }
    await _addRecord(exercise, result.sets, result.note);
  }
}

class _HomeTab extends StatelessWidget {
  const _HomeTab({
    required this.user,
    required this.avatar,
    required this.companion,
    required this.level,
    required this.chickenBalance,
    required this.completedSessions,
    required this.totalSets,
    required this.totalVolume,
    required this.onAvatarTap,
    required this.onGoRecord,
  });

  final RepickUser user;
  final AvatarCandidate avatar;
  final ShopItem? companion;
  final int level;
  final int chickenBalance;
  final int completedSessions;
  final int totalSets;
  final double totalVolume;
  final VoidCallback onAvatarTap;
  final VoidCallback onGoRecord;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      children: [
        Text(
          '${user.displayName}님, 오늘도 기록을 쌓아볼까요?',
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w900,
            color: RepickColors.navy,
          ),
        ),
        const SizedBox(height: 14),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: RepickColors.paleBlue,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        'LV.$level',
                        style: const TextStyle(
                          fontWeight: FontWeight.w900,
                          color: RepickColors.blue,
                        ),
                      ),
                    ),
                    const Spacer(),
                    TextButton.icon(
                      onPressed: onAvatarTap,
                      icon: const Icon(Icons.change_circle_outlined),
                      label: const Text('캐릭터 변경'),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Center(
                  child: SizedBox(
                    height: 260,
                    child: Stack(
                      alignment: Alignment.bottomCenter,
                      children: [
                        Positioned.fill(
                          child: DecoratedBox(
                            decoration: BoxDecoration(
                              color: const Color(0xFFEAF3FF),
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                        ),
                        Image.asset(avatar.assetPath, height: 230),
                        if (companion != null)
                          Positioned(
                            right: 38,
                            bottom: 18,
                            child: Image.asset(companion!.assetPath, width: 86),
                          ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: _MetricTile(
                        label: '닭가슴살',
                        value: '${_comma(chickenBalance)}개',
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _MetricTile(
                        label: '완료 운동',
                        value: '$completedSessions회',
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: _MetricTile(label: '저장 세트', value: '$totalSets세트'),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _MetricTile(
                        label: '누적 볼륨',
                        value: '${_comma(totalVolume.round())}kg',
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 14),
        FilledButton.icon(
          onPressed: onGoRecord,
          icon: const Icon(Icons.fitness_center),
          label: const Text('운동 기록'),
        ),
      ],
    );
  }
}

class _MetricTile extends StatelessWidget {
  const _MetricTile({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: RepickColors.paleBlue,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: RepickColors.muted,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              color: RepickColors.navy,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

class _WorkoutTab extends StatelessWidget {
  const _WorkoutTab({
    required this.activeSession,
    required this.onStart,
    required this.onFinish,
    required this.onOpenExercisePicker,
  });

  final WorkoutSession? activeSession;
  final Future<WorkoutSession> Function() onStart;
  final VoidCallback onFinish;
  final VoidCallback onOpenExercisePicker;

  @override
  Widget build(BuildContext context) {
    final records = activeSession?.records ?? const <WorkoutRecord>[];
    final setCount = records.fold<int>(
      0,
      (total, record) => total + record.sets.length,
    );
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      children: [
        _RecordSessionHeader(
          activeSession: activeSession,
          recordCount: records.length,
          setCount: setCount,
          onStart: onStart,
          onFinish: onFinish,
        ),
        const SizedBox(height: 18),
        _WorkoutLogStage(
          records: records,
          active: activeSession != null,
          onStart: onStart,
          onFinish: onFinish,
          onAddWorkout: onOpenExercisePicker,
        ),
      ],
    );
  }
}

class _RecordSessionHeader extends StatelessWidget {
  const _RecordSessionHeader({
    required this.activeSession,
    required this.recordCount,
    required this.setCount,
    required this.onStart,
    required this.onFinish,
  });

  final WorkoutSession? activeSession;
  final int recordCount;
  final int setCount;
  final Future<WorkoutSession> Function() onStart;
  final VoidCallback onFinish;

  @override
  Widget build(BuildContext context) {
    final workoutDateLabel = _formatWorkoutDateLabel(
      activeSession?.workoutDate ?? _todayKey(),
    );
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              activeSession == null
                  ? const Text(
                      '오늘 운동',
                      style: TextStyle(
                        color: RepickColors.blue,
                        fontSize: 13,
                        fontWeight: FontWeight.w900,
                      ),
                    )
                  : _ElapsedLabel(startedAt: activeSession?.startedAt),
              const SizedBox(height: 5),
              Text(
                workoutDateLabel,
                style: const TextStyle(
                  color: RepickColors.navy,
                  fontSize: 26,
                  height: 1.18,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                recordCount == 0
                    ? '운동을 시작하고 오늘 기록할 종목을 추가하세요.'
                    : '$recordCount개 운동, $setCount세트가 오늘 기록에 올라와 있습니다.',
                style: const TextStyle(color: RepickColors.muted, height: 1.45),
              ),
            ],
          ),
        ),
        const SizedBox(width: 12),
        _SessionTimerButton(
          activeSession: activeSession,
          onStart: onStart,
          onFinish: onFinish,
        ),
      ],
    );
  }
}

class _ElapsedLabel extends StatelessWidget {
  const _ElapsedLabel({required this.startedAt});

  final DateTime? startedAt;

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<int>(
      stream: Stream.periodic(const Duration(seconds: 1), (_) => 0),
      builder: (context, snapshot) {
        return Text(
          '진행 중 ${_formatSeconds(_elapsedSeconds(startedAt))}',
          style: const TextStyle(
            color: RepickColors.blue,
            fontSize: 13,
            fontWeight: FontWeight.w900,
          ),
        );
      },
    );
  }
}

class _SessionTimerButton extends StatelessWidget {
  const _SessionTimerButton({
    required this.activeSession,
    required this.onStart,
    required this.onFinish,
  });

  final WorkoutSession? activeSession;
  final Future<WorkoutSession> Function() onStart;
  final VoidCallback onFinish;

  @override
  Widget build(BuildContext context) {
    final active = activeSession != null;
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: active ? onFinish : () => onStart(),
      child: Container(
        constraints: const BoxConstraints(minWidth: 132, minHeight: 58),
        padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 10),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF0A66D8), Color(0xFF1F86FF)],
          ),
          borderRadius: BorderRadius.circular(14),
          boxShadow: const [
            BoxShadow(
              color: Color(0x470A66D8),
              blurRadius: 28,
              offset: Offset(0, 14),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              active ? Icons.check_circle_outline : Icons.timer_outlined,
              color: Colors.white,
              size: 19,
            ),
            const SizedBox(width: 9),
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                active
                    ? _ElapsedValue(startedAt: activeSession?.startedAt)
                    : const Text(
                        '운동 시작',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                Text(
                  active ? '누르면 종료' : '타이머 시작',
                  style: const TextStyle(
                    color: Color(0xBDFFFFFF),
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ElapsedValue extends StatelessWidget {
  const _ElapsedValue({required this.startedAt});

  final DateTime? startedAt;

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<int>(
      stream: Stream.periodic(const Duration(seconds: 1), (_) => 0),
      builder: (context, snapshot) {
        return Text(
          _formatSeconds(_elapsedSeconds(startedAt)),
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.w900,
          ),
        );
      },
    );
  }
}

class _WorkoutLogStage extends StatelessWidget {
  const _WorkoutLogStage({
    required this.records,
    required this.active,
    required this.onStart,
    required this.onFinish,
    required this.onAddWorkout,
  });

  final List<WorkoutRecord> records;
  final bool active;
  final Future<WorkoutSession> Function() onStart;
  final VoidCallback onFinish;
  final VoidCallback onAddWorkout;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF0C1427),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFF203252)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x220A1A33),
            blurRadius: 24,
            offset: Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        children: [
          Align(
            alignment: Alignment.centerLeft,
            child: Container(
              padding: const EdgeInsets.all(3),
              decoration: BoxDecoration(
                color: const Color(0xFF111E36),
                borderRadius: BorderRadius.circular(999),
                border: Border.all(color: const Color(0xFF253859)),
              ),
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 7,
                ),
                decoration: BoxDecoration(
                  color: RepickColors.blue,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: const Text(
                  '운동',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          if (records.isEmpty)
            const _WorkoutLogEmpty()
          else
            for (final record in records.reversed)
              _WorkoutLogItem(record: record),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 74,
                  child: FilledButton.icon(
                    onPressed: active ? onFinish : () => onStart(),
                    icon: Icon(
                      active
                          ? Icons.check_circle_outline
                          : Icons.timer_outlined,
                    ),
                    label: Text(active ? '종료' : '시작'),
                    style: FilledButton.styleFrom(
                      textStyle: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(18),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: SizedBox(
                  height: 74,
                  child: FilledButton.icon(
                    onPressed: onAddWorkout,
                    icon: const Icon(Icons.add, size: 28),
                    label: const Text('운동 추가'),
                    style: FilledButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: RepickColors.blue,
                      textStyle: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(18),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _WorkoutLogEmpty extends StatelessWidget {
  const _WorkoutLogEmpty();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: const Color(0xB80C1427),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0x2E6B84D3)),
      ),
      child: const Row(
        children: [
          _DarkIconBox(icon: Icons.fitness_center),
          SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '아직 추가된 운동이 없습니다',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 17,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  '운동 추가를 누르면 부위별 운동 목록과 세트 입력 화면이 열립니다.',
                  style: TextStyle(color: Color(0xB3FFFFFF), height: 1.4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _WorkoutLogItem extends StatelessWidget {
  const _WorkoutLogItem({required this.record});

  final WorkoutRecord record;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0x0AFFFFFF),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0x0FFFFFFF)),
      ),
      child: Row(
        children: [
          _DarkExerciseThumb(name: record.machineName),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  record.machineName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  '${record.muscleGroupLabel} · ${record.sets.length}세트',
                  style: const TextStyle(color: Color(0x8FFFFFFF)),
                ),
                const SizedBox(height: 5),
                Text(
                  record.sets
                      .map((set) => '${set.weightKg}kg x ${set.reps}회')
                      .join(' / '),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Color(0xD1FFFFFF),
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DarkExerciseThumb extends StatelessWidget {
  const _DarkExerciseThumb({required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    final assetPath = getExerciseAssetPath(name);
    return Container(
      width: 86,
      height: 72,
      decoration: BoxDecoration(
        color: const Color(0x14FFFFFF),
        borderRadius: BorderRadius.circular(12),
      ),
      clipBehavior: Clip.antiAlias,
      child: assetPath == null
          ? const Icon(Icons.fitness_center, color: Colors.white)
          : Image.asset(assetPath, fit: BoxFit.cover),
    );
  }
}

class _DarkIconBox extends StatelessWidget {
  const _DarkIconBox({required this.icon});

  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 46,
      height: 46,
      decoration: BoxDecoration(
        color: const Color(0x14FFFFFF),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Icon(icon, color: const Color(0xC7FFFFFF), size: 22),
    );
  }
}

class _ExercisePickerSheet extends StatefulWidget {
  const _ExercisePickerSheet({
    required this.loading,
    required this.exercises,
    required this.selectedGroup,
    required this.sessions,
  });

  final bool loading;
  final List<ExerciseMachine> exercises;
  final MuscleGroup selectedGroup;
  final List<WorkoutSession> sessions;

  @override
  State<_ExercisePickerSheet> createState() => _ExercisePickerSheetState();
}

class _ExercisePickerSheetState extends State<_ExercisePickerSheet> {
  late MuscleGroup _selectedGroup = widget.selectedGroup;

  List<ExerciseMachine> get _visibleExercises {
    return widget.exercises
        .where((exercise) => exercise.muscleGroup == _selectedGroup)
        .toList();
  }

  List<ExerciseMachine> get _recentExercises {
    final seenIds = <int>{};
    final recentIds = widget.sessions
        .expand((session) => session.records.reversed)
        .map((record) => record.machineId);
    return recentIds
        .where((id) => seenIds.add(id))
        .map(
          (id) => widget.exercises
              .where((exercise) => exercise.id == id)
              .firstOrNull,
        )
        .whereType<ExerciseMachine>()
        .take(8)
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final recentExercises = widget.exercises.isEmpty
        ? const <ExerciseMachine>[]
        : _recentExercises;
    return SizedBox(
      height: MediaQuery.of(context).size.height * 0.9,
      child: SafeArea(
        top: false,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
          children: [
            _PickerHeading(
              title: '${_visibleExercises.length}개의 운동 기구',
              description: '부위를 고르고 오늘 수행한 운동을 선택하세요.',
              onClose: () => Navigator.pop(context),
            ),
            if (recentExercises.isNotEmpty) ...[
              const SizedBox(height: 14),
              _QuickMachineSection(
                exercises: recentExercises,
                onSelect: (exercise) => Navigator.pop(context, exercise),
              ),
            ],
            const SizedBox(height: 14),
            _MuscleSegmentControl(
              selectedGroup: _selectedGroup,
              onChanged: (group) => setState(() => _selectedGroup = group),
            ),
            const SizedBox(height: 14),
            _CustomExerciseBar(),
            const SizedBox(height: 14),
            if (widget.loading) ...[
              const LinearProgressIndicator(minHeight: 3),
              const SizedBox(height: 12),
            ],
            _ExerciseGrid(
              exercises: _visibleExercises,
              onSelect: (exercise) => Navigator.pop(context, exercise),
            ),
          ],
        ),
      ),
    );
  }
}

class _ExerciseGrid extends StatelessWidget {
  const _ExerciseGrid({required this.exercises, required this.onSelect});

  final List<ExerciseMachine> exercises;
  final ValueChanged<ExerciseMachine> onSelect;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final spacing = 12.0;
        final maxWidth = constraints.maxWidth.isFinite
            ? constraints.maxWidth
            : MediaQuery.of(context).size.width - 32;
        final cardWidth = (maxWidth - spacing) / 2;
        return Wrap(
          spacing: spacing,
          runSpacing: spacing,
          children: [
            for (final exercise in exercises)
              SizedBox(
                width: cardWidth,
                height: 236,
                child: _ExerciseGridCard(
                  exercise: exercise,
                  onTap: () => onSelect(exercise),
                ),
              ),
          ],
        );
      },
    );
  }
}

class _PickerHeading extends StatelessWidget {
  const _PickerHeading({
    required this.title,
    required this.description,
    required this.onClose,
  });

  final String title;
  final String description;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: RepickColors.navy,
                  fontSize: 20,
                  height: 1.25,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 7),
              Text(
                description,
                style: const TextStyle(color: RepickColors.muted, fontSize: 14),
              ),
            ],
          ),
        ),
        GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: onClose,
          child: const Padding(
            padding: EdgeInsets.symmetric(horizontal: 4, vertical: 8),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '닫기',
                  style: TextStyle(
                    color: RepickColors.blue,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                SizedBox(width: 2),
                Icon(Icons.chevron_right, color: RepickColors.blue, size: 18),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _QuickMachineSection extends StatelessWidget {
  const _QuickMachineSection({required this.exercises, required this.onSelect});

  final List<ExerciseMachine> exercises;
  final ValueChanged<ExerciseMachine> onSelect;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FBFF),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFE1E8F5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Text(
                '바로 선택',
                style: TextStyle(
                  color: Color(0xFF102849),
                  fontWeight: FontWeight.w900,
                ),
              ),
              Spacer(),
              Text(
                '최근 기록',
                style: TextStyle(
                  color: RepickColors.muted,
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                for (final exercise in exercises)
                  Padding(
                    padding: const EdgeInsets.only(right: 10),
                    child: _QuickMachinePill(
                      exercise: exercise,
                      onTap: () => onSelect(exercise),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickMachinePill extends StatelessWidget {
  const _QuickMachinePill({required this.exercise, required this.onTap});

  final ExerciseMachine exercise;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: Container(
        width: 206,
        padding: const EdgeInsets.all(9),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: const Color(0xFFDFE8F4)),
          boxShadow: const [
            BoxShadow(
              color: Color(0x0D0F1F38),
              blurRadius: 18,
              offset: Offset(0, 8),
            ),
          ],
        ),
        child: Row(
          children: [
            _ExerciseThumb(name: exercise.name, size: 50),
            const SizedBox(width: 9),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    exercise.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Color(0xFF102849),
                      fontSize: 14,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 3),
                  const Text(
                    '최근 사용',
                    style: TextStyle(
                      color: RepickColors.muted,
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MuscleSegmentControl extends StatelessWidget {
  const _MuscleSegmentControl({
    required this.selectedGroup,
    required this.onChanged,
  });

  final MuscleGroup selectedGroup;
  final ValueChanged<MuscleGroup> onChanged;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        for (final group in MuscleGroup.values)
          GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: () => onChanged(group),
            child: Container(
              constraints: const BoxConstraints(minHeight: 38),
              padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 8),
              decoration: BoxDecoration(
                color: selectedGroup == group
                    ? RepickColors.blue
                    : Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: selectedGroup == group
                      ? RepickColors.blue
                      : RepickColors.line,
                ),
              ),
              child: Text(
                group.label,
                style: TextStyle(
                  color: selectedGroup == group
                      ? Colors.white
                      : RepickColors.navy,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
      ],
    );
  }
}

class _CustomExerciseBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: RepickColors.line),
      ),
      child: Row(
        children: [
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '내 기구 등록',
                  style: TextStyle(
                    color: RepickColors.navy,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                SizedBox(height: 3),
                Text(
                  '브랜드명이나 헬스장 전용 명칭까지 그대로 저장하세요.',
                  style: TextStyle(color: RepickColors.muted, fontSize: 13),
                ),
              ],
            ),
          ),
          Container(
            constraints: const BoxConstraints(minHeight: 38),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFFF3F6FB),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: RepickColors.line),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.add, color: RepickColors.muted, size: 18),
                SizedBox(width: 5),
                Text(
                  '커스텀 추가',
                  style: TextStyle(
                    color: RepickColors.muted,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ExerciseGridCard extends StatelessWidget {
  const _ExerciseGridCard({required this.exercise, required this.onTap});

  final ExerciseMachine exercise;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: RepickColors.line),
          boxShadow: const [
            BoxShadow(
              color: Color(0x0A0F1F38),
              blurRadius: 18,
              offset: Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _ExerciseThumb(name: exercise.name, size: 58),
            const SizedBox(height: 10),
            Text(
              exercise.name,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                color: RepickColors.blue,
                fontSize: 16,
                height: 1.25,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 8),
            Expanded(
              child: Text(
                exercise.description ?? '${exercise.muscleGroupLabel} 운동',
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Color(0xFF4F5B68),
                  fontSize: 13,
                  height: 1.45,
                ),
              ),
            ),
            Wrap(
              spacing: 5,
              runSpacing: 5,
              children: [
                _TagChip(label: '#${exercise.muscleGroupLabel}'),
                _TagChip(label: '#${exercise.movementPattern}'),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ExerciseThumb extends StatelessWidget {
  const _ExerciseThumb({required this.name, required this.size});

  final String name;
  final double size;

  @override
  Widget build(BuildContext context) {
    final assetPath = getExerciseAssetPath(name);
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: RepickColors.paleBlue,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: RepickColors.line),
      ),
      clipBehavior: Clip.antiAlias,
      child: assetPath == null
          ? Icon(
              Icons.fitness_center,
              color: RepickColors.blue,
              size: size * 0.34,
            )
          : Image.asset(
              assetPath,
              fit: BoxFit.cover,
              alignment: Alignment.center,
            ),
    );
  }
}

class _TagChip extends StatelessWidget {
  const _TagChip({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: RepickColors.paleBlue,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: RepickColors.blue,
          fontSize: 12,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _RecordDraft {
  const _RecordDraft({required this.sets, this.note});

  final List<WorkoutSetEntry> sets;
  final String? note;
}

class _AddRecordSheet extends StatefulWidget {
  const _AddRecordSheet({required this.exercise});

  final ExerciseMachine exercise;

  @override
  State<_AddRecordSheet> createState() => _AddRecordSheetState();
}

class _AddRecordSheetState extends State<_AddRecordSheet> {
  final _noteController = TextEditingController();
  final _weightControllers = List.generate(3, (_) => TextEditingController());
  final _repControllers = List.generate(3, (_) => TextEditingController());
  final _completedSets = List.generate(3, (_) => false);
  Timer? _restTimer;
  var _restDurationSeconds = 60;
  var _restRemainingSeconds = 0;
  int? _lastCompletedSetNumber;

  @override
  void dispose() {
    _restTimer?.cancel();
    _noteController.dispose();
    for (final controller in [..._weightControllers, ..._repControllers]) {
      controller.dispose();
    }
    super.dispose();
  }

  void _addSet() {
    setState(() {
      _weightControllers.add(TextEditingController());
      _repControllers.add(TextEditingController());
      _completedSets.add(false);
    });
  }

  void _deleteSet(int index) {
    if (_weightControllers.length == 1) {
      return;
    }

    setState(() {
      _weightControllers.removeAt(index).dispose();
      _repControllers.removeAt(index).dispose();
      _completedSets.removeAt(index);
    });
  }

  void _toggleComplete(int index) {
    setState(() {
      _completedSets[index] = !_completedSets[index];
      if (_completedSets[index]) {
        _lastCompletedSetNumber = index + 1;
        _startRestTimer();
      }
    });
  }

  void _startRestTimer() {
    _restTimer?.cancel();
    _restRemainingSeconds = _restDurationSeconds;
    _restTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      setState(() {
        if (_restRemainingSeconds <= 1) {
          _restRemainingSeconds = 0;
          timer.cancel();
          return;
        }
        _restRemainingSeconds -= 1;
      });
    });
  }

  void _updateRestDuration(int deltaSeconds) {
    setState(() {
      _restDurationSeconds = (_restDurationSeconds + deltaSeconds).clamp(
        10,
        300,
      );
      if (_restRemainingSeconds == 0) {
        _lastCompletedSetNumber = null;
      }
    });
  }

  void _resetDraft() {
    setState(() {
      for (final controller in [..._weightControllers, ..._repControllers]) {
        controller.clear();
      }
      for (var index = 0; index < _completedSets.length; index++) {
        _completedSets[index] = false;
      }
      _noteController.clear();
      _restRemainingSeconds = 0;
      _lastCompletedSetNumber = null;
    });
    _restTimer?.cancel();
  }

  void _submit() {
    final sets = <WorkoutSetEntry>[];
    for (var index = 0; index < _weightControllers.length; index++) {
      final weight = num.tryParse(_weightControllers[index].text.trim());
      final reps = int.tryParse(_repControllers[index].text.trim());
      if (weight != null && weight >= 0 && reps != null && reps > 0) {
        sets.add(
          WorkoutSetEntry(
            setOrder: index + 1,
            weightKg: weight,
            reps: reps,
            completed: _completedSets[index],
          ),
        );
      }
    }

    if (sets.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('최소 1개 이상의 세트를 입력하세요.')));
      return;
    }

    Navigator.pop(
      context,
      _RecordDraft(
        sets: sets,
        note: _noteController.text.trim().isEmpty
            ? null
            : _noteController.text.trim(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final keyboardBottom = MediaQuery.of(context).viewInsets.bottom;
    return SizedBox(
      height: MediaQuery.of(context).size.height * 0.9,
      child: SafeArea(
        top: false,
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: EdgeInsets.fromLTRB(16, 0, 16, keyboardBottom + 16),
                children: [
                  _ExerciseFormHeader(exercise: widget.exercise),
                  const SizedBox(height: 14),
                  _SetsControlPanel(
                    restDurationSeconds: _restDurationSeconds,
                    restRemainingSeconds: _restRemainingSeconds,
                    lastCompletedSetNumber: _lastCompletedSetNumber,
                    onDecreaseRest: () => _updateRestDuration(-10),
                    onIncreaseRest: () => _updateRestDuration(10),
                    onAddSet: _addSet,
                  ),
                  const SizedBox(height: 12),
                  const _SetColumnGuide(),
                  const SizedBox(height: 8),
                  for (
                    var index = 0;
                    index < _weightControllers.length;
                    index++
                  )
                    _SetInputRow(
                      index: index,
                      weightController: _weightControllers[index],
                      repsController: _repControllers[index],
                      completed: _completedSets[index],
                      canDelete: _weightControllers.length > 1,
                      onToggleComplete: () => _toggleComplete(index),
                      onDelete: () => _deleteSet(index),
                    ),
                  const SizedBox(height: 14),
                  TextField(
                    controller: _noteController,
                    textInputAction: TextInputAction.done,
                    onSubmitted: (_) =>
                        FocusManager.instance.primaryFocus?.unfocus(),
                    minLines: 2,
                    maxLines: 4,
                    decoration: const InputDecoration(
                      labelText: '기구별 메모',
                      hintText: '자세, 느낌, 다음 목표',
                    ),
                  ),
                ],
              ),
            ),
            Container(
              padding: EdgeInsets.fromLTRB(
                16,
                12,
                16,
                keyboardBottom > 0 ? keyboardBottom + 12 : 16,
              ),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: RepickColors.line)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (keyboardBottom > 0) ...[
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton.icon(
                        onPressed: () =>
                            FocusManager.instance.primaryFocus?.unfocus(),
                        icon: const Icon(Icons.keyboard_hide_outlined),
                        label: const Text('키보드 닫기'),
                      ),
                    ),
                    const SizedBox(height: 6),
                  ],
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: _resetDraft,
                          icon: const Icon(Icons.refresh),
                          label: const Text('초기화'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: FilledButton.icon(
                          onPressed: _submit,
                          icon: const Icon(Icons.save),
                          label: const Text('기록 저장'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ExerciseFormHeader extends StatelessWidget {
  const _ExerciseFormHeader({required this.exercise});

  final ExerciseMachine exercise;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: RepickColors.line),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0D0F1F38),
            blurRadius: 18,
            offset: Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _ExerciseThumb(name: exercise.name, size: 74),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  exercise.muscleGroupLabel,
                  style: const TextStyle(
                    color: RepickColors.blue,
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  exercise.name,
                  style: const TextStyle(
                    color: RepickColors.navy,
                    fontSize: 22,
                    height: 1.15,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  exercise.description ?? '기구를 선택하면 기록 입력과 이전 기록이 연결됩니다.',
                  style: const TextStyle(
                    color: RepickColors.muted,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SetsControlPanel extends StatelessWidget {
  const _SetsControlPanel({
    required this.restDurationSeconds,
    required this.restRemainingSeconds,
    required this.lastCompletedSetNumber,
    required this.onDecreaseRest,
    required this.onIncreaseRest,
    required this.onAddSet,
  });

  final int restDurationSeconds;
  final int restRemainingSeconds;
  final int? lastCompletedSetNumber;
  final VoidCallback onDecreaseRest;
  final VoidCallback onIncreaseRest;
  final VoidCallback onAddSet;

  @override
  Widget build(BuildContext context) {
    final timerActive = restRemainingSeconds > 0;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: RepickColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '세트 기록',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w900,
              color: RepickColors.navy,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'kg와 횟수를 입력하고 세트완료를 누르면 휴식 타이머가 시작됩니다.',
            style: TextStyle(color: RepickColors.muted, height: 1.35),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: timerActive
                  ? const Color(0xFFEAF3FF)
                  : RepickColors.paleBlue,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: timerActive
                    ? const Color(0xFFB8D6FF)
                    : RepickColors.line,
              ),
            ),
            child: Row(
              children: [
                const Icon(Icons.timer_outlined, color: RepickColors.blue),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        '휴식 타이머',
                        style: TextStyle(
                          color: RepickColors.muted,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      Text(
                        timerActive
                            ? '${lastCompletedSetNumber ?? ''}세트 후 휴식 중'
                            : '세트완료 시 시작',
                        style: const TextStyle(
                          fontSize: 12,
                          color: RepickColors.muted,
                        ),
                      ),
                    ],
                  ),
                ),
                Text(
                  _formatSeconds(
                    timerActive ? restRemainingSeconds : restDurationSeconds,
                  ),
                  style: const TextStyle(
                    color: RepickColors.blue,
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: Container(
                  height: 48,
                  decoration: BoxDecoration(
                    color: RepickColors.paleBlue,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: RepickColors.line),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      IconButton(
                        tooltip: '휴식 시간 10초 줄이기',
                        onPressed: restDurationSeconds <= 10
                            ? null
                            : onDecreaseRest,
                        icon: const Icon(Icons.remove),
                      ),
                      Text(
                        _formatSeconds(restDurationSeconds),
                        style: const TextStyle(fontWeight: FontWeight.w900),
                      ),
                      IconButton(
                        tooltip: '휴식 시간 10초 늘리기',
                        onPressed: restDurationSeconds >= 300
                            ? null
                            : onIncreaseRest,
                        icon: const Icon(Icons.add),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              SizedBox(
                width: 122,
                child: FilledButton.icon(
                  onPressed: onAddSet,
                  icon: const Icon(Icons.add),
                  label: const Text('세트 추가'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SetColumnGuide extends StatelessWidget {
  const _SetColumnGuide();

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.symmetric(horizontal: 8),
      child: Row(
        children: [
          SizedBox(width: 36, child: Text('세트')),
          SizedBox(width: 8),
          Expanded(child: Text('무게')),
          SizedBox(width: 8),
          Expanded(child: Text('횟수')),
          SizedBox(width: 68, child: Center(child: Text('완료'))),
          SizedBox(width: 40),
        ],
      ),
    );
  }
}

class _SetInputRow extends StatelessWidget {
  const _SetInputRow({
    required this.index,
    required this.weightController,
    required this.repsController,
    required this.completed,
    required this.canDelete,
    required this.onToggleComplete,
    required this.onDelete,
  });

  final int index;
  final TextEditingController weightController;
  final TextEditingController repsController;
  final bool completed;
  final bool canDelete;
  final VoidCallback onToggleComplete;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: completed ? const Color(0xFFEAF3FF) : Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: completed ? const Color(0xFFB8D6FF) : RepickColors.line,
        ),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 36,
            child: Center(
              child: Text(
                '${index + 1}',
                style: const TextStyle(
                  color: RepickColors.navy,
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: TextField(
              controller: weightController,
              keyboardType: const TextInputType.numberWithOptions(
                decimal: true,
              ),
              textInputAction: TextInputAction.next,
              decoration: const InputDecoration(
                labelText: 'kg',
                hintText: '0',
                contentPadding: EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 12,
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: TextField(
              controller: repsController,
              keyboardType: TextInputType.number,
              textInputAction: TextInputAction.done,
              onSubmitted: (_) => FocusManager.instance.primaryFocus?.unfocus(),
              decoration: const InputDecoration(
                labelText: '회',
                hintText: '0',
                contentPadding: EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 12,
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
          SizedBox(
            width: 60,
            child: IconButton.filledTonal(
              tooltip: '${index + 1}세트 완료',
              onPressed: onToggleComplete,
              icon: Icon(
                completed ? Icons.check_circle : Icons.check_circle_outline,
              ),
              color: completed ? RepickColors.blue : RepickColors.muted,
            ),
          ),
          IconButton(
            tooltip: '${index + 1}세트 삭제',
            onPressed: canDelete ? onDelete : null,
            icon: const Icon(Icons.delete_outline),
          ),
        ],
      ),
    );
  }
}

class _OneRmTab extends StatefulWidget {
  const _OneRmTab();

  @override
  State<_OneRmTab> createState() => _OneRmTabState();
}

class _OneRmTabState extends State<_OneRmTab> {
  static const _oneRmExercises = [
    _OneRmExercise(value: 'squat', label: '스쿼트'),
    _OneRmExercise(value: 'benchPress', label: '벤치프레스'),
    _OneRmExercise(value: 'deadlift', label: '데드리프트'),
    _OneRmExercise(value: 'overheadPress', label: '오버헤드프레스'),
  ];

  final _weightController = TextEditingController();
  final _repsController = TextEditingController();
  var _selectedLift = _oneRmExercises.first;

  @override
  void dispose() {
    _weightController.dispose();
    _repsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final weight = num.tryParse(_weightController.text);
    final reps = int.tryParse(_repsController.text);
    final result = weight != null && reps != null && weight > 0 && reps > 0
        ? weight * (1 + reps / 30)
        : null;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      children: [
        const Text(
          '1RM 계산기',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w900,
            color: RepickColors.navy,
          ),
        ),
        const SizedBox(height: 4),
        const Text(
          'Epley Formula로 주요 리프트의 예상 1RM을 계산합니다.',
          style: TextStyle(color: RepickColors.muted),
        ),
        const SizedBox(height: 12),
        DropdownButtonFormField<_OneRmExercise>(
          initialValue: _selectedLift,
          decoration: const InputDecoration(labelText: '종목'),
          items: _oneRmExercises
              .map(
                (exercise) => DropdownMenuItem(
                  value: exercise,
                  child: Text(exercise.label),
                ),
              )
              .toList(),
          onChanged: (value) =>
              setState(() => _selectedLift = value ?? _selectedLift),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _weightController,
          keyboardType: TextInputType.number,
          textInputAction: TextInputAction.next,
          decoration: const InputDecoration(labelText: '사용 중량 kg'),
          onChanged: (_) => setState(() {}),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _repsController,
          keyboardType: TextInputType.number,
          textInputAction: TextInputAction.done,
          onSubmitted: (_) => FocusManager.instance.primaryFocus?.unfocus(),
          decoration: const InputDecoration(labelText: '반복 횟수'),
          onChanged: (_) => setState(() {}),
        ),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Epley Formula',
                  style: TextStyle(
                    color: RepickColors.blue,
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  '${_selectedLift.label} 예상 1RM',
                  style: TextStyle(
                    color: RepickColors.muted,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  result == null ? '-' : '${result.toStringAsFixed(1)} kg',
                  style: const TextStyle(
                    fontSize: 34,
                    fontWeight: FontWeight.w900,
                    color: RepickColors.blue,
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  '1RM = W x (1 + R / 30)',
                  style: TextStyle(
                    color: RepickColors.navy,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  result == null
                      ? '종목, 중량, 횟수를 입력하면 예상 최대 중량이 표시됩니다.'
                      : '${weight}kg x $reps회 기준으로 계산했습니다.',
                  style: const TextStyle(
                    color: RepickColors.muted,
                    height: 1.45,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _OneRmExercise {
  const _OneRmExercise({required this.value, required this.label});

  final String value;
  final String label;
}

class _ShopTab extends StatelessWidget {
  const _ShopTab({
    required this.user,
    required this.shopState,
    required this.balance,
    required this.selectedAvatarId,
    required this.onFreeChicken,
    required this.onBuy,
    required this.onEquipAvatar,
    required this.onEquipCompanion,
  });

  final RepickUser user;
  final ShopState shopState;
  final int balance;
  final String? selectedAvatarId;
  final VoidCallback onFreeChicken;
  final ValueChanged<ShopItem> onBuy;
  final ValueChanged<String> onEquipAvatar;
  final ValueChanged<String> onEquipCompanion;

  @override
  Widget build(BuildContext context) {
    final avatarItems = avatarShopItemsFor(user.gender);
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  '보유 닭가슴살',
                  style: TextStyle(
                    color: RepickColors.muted,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${_comma(balance)}개',
                  style: const TextStyle(
                    fontSize: 30,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 10),
                OutlinedButton.icon(
                  onPressed: onFreeChicken,
                  icon: const Icon(Icons.card_giftcard),
                  label: const Text('무료 닭가슴살 받기'),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        const Text(
          '캐릭터',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 8),
        for (final item in avatarItems)
          _ShopItemCard(
            item: item,
            owned: shopState.owns(item.id),
            equipped: selectedAvatarId == item.avatarId,
            balance: balance,
            onPressed: () => shopState.owns(item.id)
                ? onEquipAvatar(item.avatarId!)
                : onBuy(item),
          ),
        const SizedBox(height: 12),
        const Text(
          '펫',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 8),
        for (final item in companionItems)
          _ShopItemCard(
            item: item,
            owned: shopState.owns(item.id),
            equipped: shopState.equippedCompanionId == item.id,
            balance: balance,
            onPressed: () => shopState.owns(item.id)
                ? onEquipCompanion(item.id)
                : onBuy(item),
          ),
      ],
    );
  }
}

class _ShopItemCard extends StatelessWidget {
  const _ShopItemCard({
    required this.item,
    required this.owned,
    required this.equipped,
    required this.balance,
    required this.onPressed,
  });

  final ShopItem item;
  final bool owned;
  final bool equipped;
  final int balance;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              width: 82,
              height: 82,
              decoration: BoxDecoration(
                color: RepickColors.paleBlue,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Image.asset(item.assetPath, fit: BoxFit.contain),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.name,
                    style: const TextStyle(fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    item.description,
                    style: const TextStyle(color: RepickColors.muted),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${item.price}개',
                    style: const TextStyle(
                      color: RepickColors.blue,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            FilledButton(
              onPressed: equipped || (!owned && balance < item.price)
                  ? null
                  : onPressed,
              child: Text(
                equipped
                    ? '장착중'
                    : owned
                    ? '장착'
                    : '구매',
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ActivityTab extends StatefulWidget {
  const _ActivityTab({required this.sessions, required this.onDeleteSession});

  final List<WorkoutSession> sessions;
  final Future<void> Function(WorkoutSession session) onDeleteSession;

  @override
  State<_ActivityTab> createState() => _ActivityTabState();
}

class _ActivityTabState extends State<_ActivityTab> {
  var _selectedDate = _todayKey();

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final firstDay = DateTime(now.year, now.month);
    final daysInMonth = DateTime(now.year, now.month + 1, 0).day;
    final offset = firstDay.weekday % 7;
    final counts = <String, int>{};
    final monthSessions = widget.sessions.where((session) {
      final date = DateTime.tryParse('${session.workoutDate}T00:00:00');
      return date != null && date.year == now.year && date.month == now.month;
    }).toList();
    for (final session in monthSessions) {
      counts[session.workoutDate] = (counts[session.workoutDate] ?? 0) + 1;
    }
    final trainedDateCount = counts.keys.length;
    final todaysExerciseNames = widget.sessions
        .where((session) => session.workoutDate == _todayKey())
        .expand(
          (session) => session.records.map((record) => record.machineName),
        )
        .where((name) => name.isNotEmpty)
        .toSet()
        .toList();
    final selectedDateSessions = widget.sessions
        .where((session) => session.workoutDate == _selectedDate)
        .toList();
    final selectedDateStats = _WorkoutSessionStats.combine(
      selectedDateSessions,
    );

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      children: [
        const Text(
          '최근 운동 세션들',
          style: TextStyle(
            color: RepickColors.navy,
            fontSize: 22,
            fontWeight: FontWeight.w900,
          ),
        ),
        const SizedBox(height: 4),
        const Text(
          '저장한 기록이 여기에 쌓입니다.',
          style: TextStyle(color: RepickColors.muted),
        ),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  '이번 달 운동일',
                  style: TextStyle(
                    color: RepickColors.blue,
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '$trainedDateCount일',
                  style: const TextStyle(
                    color: RepickColors.navy,
                    fontSize: 36,
                    height: 1,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  todaysExerciseNames.isEmpty
                      ? '오늘 운동을 시작하면 캘린더에 바로 표시됩니다.'
                      : '오늘은 ${todaysExerciseNames.join(', ')}를 기록했습니다.',
                  style: const TextStyle(
                    color: RepickColors.muted,
                    height: 1.45,
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Row(
                  children: [
                    Text(
                      '${now.year}년 ${now.month}월',
                      style: const TextStyle(
                        color: RepickColors.navy,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const Spacer(),
                    const Text(
                      '운동한 날 표시',
                      style: TextStyle(
                        color: RepickColors.muted,
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 7,
                  mainAxisSpacing: 6,
                  crossAxisSpacing: 6,
                  children: [
                    for (final label in ['일', '월', '화', '수', '목', '금', '토'])
                      Center(
                        child: Text(
                          label,
                          style: const TextStyle(
                            fontWeight: FontWeight.w900,
                            color: RepickColors.muted,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    for (var i = 0; i < offset; i++) const SizedBox.shrink(),
                    for (var day = 1; day <= daysInMonth; day++)
                      Builder(
                        builder: (context) {
                          final dateKey = _dateKey(
                            DateTime(now.year, now.month, day),
                          );
                          return _CalendarCell(
                            day: day,
                            count: counts[dateKey] ?? 0,
                            selected: _selectedDate == dateKey,
                            onTap: () =>
                                setState(() => _selectedDate = dateKey),
                          );
                        },
                      ),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            '선택 날짜',
                            style: TextStyle(
                              color: RepickColors.blue,
                              fontSize: 13,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _formatWorkoutDateLabel(_selectedDate),
                            style: const TextStyle(
                              color: RepickColors.navy,
                              fontSize: 20,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      '${selectedDateStats.exerciseCount}개 운동 · '
                      '${selectedDateStats.setCount}세트 · '
                      '${_comma(selectedDateStats.volume)}kg',
                      textAlign: TextAlign.right,
                      style: const TextStyle(
                        color: RepickColors.muted,
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                if (selectedDateSessions.isEmpty)
                  const Text(
                    '이 날짜에는 저장된 운동이 없습니다.',
                    style: TextStyle(color: RepickColors.muted),
                  )
                else
                  for (final session in selectedDateSessions)
                    _ActivitySessionCard(
                      session: session,
                      onOpenDetail: () => _showSessionDetailSheet(session),
                      onDelete: () => widget.onDeleteSession(session),
                    ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _showSessionDetailSheet(WorkoutSession session) async {
    await showModalBottomSheet<void>(
      context: context,
      enableDrag: false,
      isScrollControlled: true,
      showDragHandle: false,
      useSafeArea: true,
      builder: (context) => _WorkoutSessionDetailSheet(session: session),
    );
  }
}

class _WorkoutSessionStats {
  const _WorkoutSessionStats({
    required this.exerciseCount,
    required this.setCount,
    required this.volume,
    required this.parts,
  });

  final int exerciseCount;
  final int setCount;
  final num volume;
  final List<String> parts;

  factory _WorkoutSessionStats.fromSession(WorkoutSession session) {
    final parts = <String>{};
    var setCount = 0;
    num volume = 0;

    for (final record in session.records) {
      if (record.muscleGroupLabel.isNotEmpty) {
        parts.add(record.muscleGroupLabel);
      }
      setCount += record.sets.length;
      for (final set in record.sets) {
        volume += set.weightKg * set.reps;
      }
    }

    return _WorkoutSessionStats(
      exerciseCount: session.records.length,
      setCount: setCount,
      volume: volume,
      parts: parts.toList(),
    );
  }

  static _WorkoutSessionStats combine(List<WorkoutSession> sessions) {
    final parts = <String>{};
    var exerciseCount = 0;
    var setCount = 0;
    num volume = 0;

    for (final session in sessions) {
      final stats = _WorkoutSessionStats.fromSession(session);
      exerciseCount += stats.exerciseCount;
      setCount += stats.setCount;
      volume += stats.volume;
      parts.addAll(stats.parts);
    }

    return _WorkoutSessionStats(
      exerciseCount: exerciseCount,
      setCount: setCount,
      volume: volume,
      parts: parts.toList(),
    );
  }
}

class _ActivitySessionCard extends StatelessWidget {
  const _ActivitySessionCard({
    required this.session,
    required this.onOpenDetail,
    required this.onDelete,
  });

  final WorkoutSession session;
  final VoidCallback onOpenDetail;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final stats = _WorkoutSessionStats.fromSession(session);
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onOpenDetail,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(13),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FBFF),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: RepickColors.line),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${stats.exerciseCount}개 운동',
                    style: const TextStyle(
                      color: RepickColors.navy,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    stats.parts.isEmpty ? '부위 기록 없음' : stats.parts.join(', '),
                    style: const TextStyle(
                      color: RepickColors.muted,
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '${stats.setCount}세트 · ${_comma(stats.volume)}kg',
                  style: const TextStyle(
                    color: RepickColors.muted,
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 6),
                GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: onOpenDetail,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 7,
                    ),
                    decoration: BoxDecoration(
                      color: RepickColors.paleBlue,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          '상세',
                          style: TextStyle(
                            color: RepickColors.blue,
                            fontSize: 13,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        SizedBox(width: 3),
                        Icon(
                          Icons.chevron_right,
                          color: RepickColors.blue,
                          size: 16,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 6),
            IconButton(
              tooltip: '${session.workoutDate} 세션 삭제',
              onPressed: onDelete,
              icon: const Icon(Icons.delete_outline),
              color: Colors.redAccent,
            ),
          ],
        ),
      ),
    );
  }
}

class _WorkoutSessionDetailSheet extends StatefulWidget {
  const _WorkoutSessionDetailSheet({required this.session});

  final WorkoutSession session;

  @override
  State<_WorkoutSessionDetailSheet> createState() =>
      _WorkoutSessionDetailSheetState();
}

class _WorkoutSessionDetailSheetState
    extends State<_WorkoutSessionDetailSheet> {
  final _shareKey = GlobalKey();
  var _sharing = false;

  Future<void> _shareWorkoutImage() async {
    if (_sharing) {
      return;
    }

    setState(() => _sharing = true);
    try {
      final pixelRatio = min(
        3,
        MediaQuery.of(context).devicePixelRatio,
      ).toDouble();
      final box = context.findRenderObject() as RenderBox?;
      final shareOrigin = box == null
          ? null
          : box.localToGlobal(Offset.zero) & box.size;

      await WidgetsBinding.instance.endOfFrame;
      final boundary =
          _shareKey.currentContext?.findRenderObject()
              as RenderRepaintBoundary?;
      if (boundary == null) {
        throw StateError('공유 이미지를 만들 수 없습니다.');
      }

      final image = await boundary.toImage(pixelRatio: pixelRatio);
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      final bytes = byteData?.buffer.asUint8List();
      if (bytes == null || bytes.isEmpty) {
        throw StateError('공유 이미지 변환에 실패했습니다.');
      }

      final fileName = 'repick-workout-${widget.session.workoutDate}.png';
      await SharePlus.instance.share(
        ShareParams(
          files: [
            XFile.fromData(
              Uint8List.fromList(bytes),
              name: fileName,
              mimeType: 'image/png',
            ),
          ],
          fileNameOverrides: [fileName],
          sharePositionOrigin: shareOrigin,
          downloadFallbackEnabled: true,
        ),
      );
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('공유 이미지 생성에 실패했어요. ${error.toString()}')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _sharing = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final stats = _WorkoutSessionStats.fromSession(widget.session);
    final totalReps = widget.session.records.fold<int>(
      0,
      (total, record) =>
          total + record.sets.fold(0, (subtotal, set) => subtotal + set.reps),
    );
    final durationMinutes = widget.session.durationSeconds == null
        ? null
        : max(1, (widget.session.durationSeconds! / 60).round());

    return SizedBox(
      height: MediaQuery.of(context).size.height * 0.9,
      child: SafeArea(
        top: false,
        child: DecoratedBox(
          decoration: const BoxDecoration(color: Colors.white),
          child: Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  child: RepaintBoundary(
                    key: _shareKey,
                    child: _WorkoutDetailShareCard(
                      session: widget.session,
                      title: _shareWorkoutTitle(stats.parts),
                      durationLabel: durationMinutes == null
                          ? '-'
                          : '$durationMinutes분',
                      setCount: stats.setCount,
                      totalReps: totalReps,
                      volume: stats.volume,
                    ),
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  border: Border(top: BorderSide(color: RepickColors.line)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => Navigator.pop(context),
                        icon: const Icon(Icons.close),
                        label: const Text('닫기'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: FilledButton.icon(
                        onPressed: _sharing ? null : _shareWorkoutImage,
                        icon: _sharing
                            ? const SizedBox.square(
                                dimension: 18,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              )
                            : const Icon(Icons.ios_share),
                        label: Text(_sharing ? '생성 중' : '공유하기'),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _WorkoutDetailShareCard extends StatelessWidget {
  const _WorkoutDetailShareCard({
    required this.session,
    required this.title,
    required this.durationLabel,
    required this.setCount,
    required this.totalReps,
    required this.volume,
  });

  final WorkoutSession session;
  final String title;
  final String durationLabel;
  final int setCount;
  final int totalReps;
  final num volume;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(color: Colors.white),
      child: Column(
        children: [
          _WorkoutDetailHero(
            session: session,
            title: title,
            durationLabel: durationLabel,
            setCount: setCount,
            totalReps: totalReps,
            volume: volume,
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(22, 0, 22, 24),
            child: Column(
              children: [
                for (final record in session.records)
                  _WorkoutDetailRecordCard(record: record),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _WorkoutDetailHero extends StatelessWidget {
  const _WorkoutDetailHero({
    required this.session,
    required this.title,
    required this.durationLabel,
    required this.setCount,
    required this.totalReps,
    required this.volume,
  });

  final WorkoutSession session;
  final String title;
  final String durationLabel;
  final int setCount;
  final int totalReps;
  final num volume;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(22, 20, 22, 28),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          colors: [Color(0xFFCBE8FF), Color(0xFFD8EAFF), Color(0xFFEADCFD)],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  _formatShareDateTime(session),
                  style: const TextStyle(
                    color: Color(0xFF2C7DF0),
                    fontSize: 15,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              Container(
                width: 52,
                height: 52,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Text(
                  'REPICK',
                  style: TextStyle(
                    color: Color(0xFF3F7DF6),
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Text(
            title,
            style: const TextStyle(
              color: Color(0xFF2C7DF0),
              fontSize: 28,
              height: 1.05,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 20),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _WorkoutDetailStatPill(value: durationLabel, label: '운동시간'),
              _WorkoutDetailStatPill(value: '$setCount', label: '세트'),
              _WorkoutDetailStatPill(value: '$totalReps', label: '반복'),
              _WorkoutDetailStatPill(value: _comma(volume), label: 'kg'),
            ],
          ),
        ],
      ),
    );
  }
}

class _WorkoutDetailStatPill extends StatelessWidget {
  const _WorkoutDetailStatPill({required this.value, required this.label});

  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.58),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            value,
            style: const TextStyle(
              color: Color(0xFF536274),
              fontSize: 17,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(width: 5),
          Text(
            label,
            style: const TextStyle(
              color: Color(0xFF8A96A6),
              fontSize: 12,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

class _WorkoutDetailRecordCard extends StatelessWidget {
  const _WorkoutDetailRecordCard({required this.record});

  final WorkoutRecord record;

  @override
  Widget build(BuildContext context) {
    final volume = record.sets.fold<num>(
      0,
      (total, set) => total + set.weightKg * set.reps,
    );

    return Container(
      padding: const EdgeInsets.fromLTRB(0, 22, 0, 24),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: Color(0xFFEEF1F6))),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _ExerciseThumb(name: record.machineName, size: 72),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      record.machineName,
                      style: const TextStyle(
                        color: Color(0xFF3D4856),
                        fontSize: 20,
                        height: 1.16,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '${_comma(volume)} kg',
                      style: const TextStyle(
                        color: Color(0xFF8A96A6),
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    if (record.muscleGroupLabel.isNotEmpty) ...[
                      const SizedBox(height: 9),
                      Text(
                        record.muscleGroupLabel,
                        style: const TextStyle(
                          color: Color(0xFF697484),
                          fontSize: 14,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ],
                    if (record.note != null && record.note!.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Text(
                        record.note!,
                        style: const TextStyle(
                          color: Color(0xFF697484),
                          fontSize: 13,
                          height: 1.4,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              for (final set in record.sets) _WorkoutSetBadge(entry: set),
            ],
          ),
        ],
      ),
    );
  }
}

class _WorkoutSetBadge extends StatelessWidget {
  const _WorkoutSetBadge({required this.entry});

  final WorkoutSetEntry entry;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 50,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 50,
            height: 50,
            alignment: Alignment.center,
            decoration: const BoxDecoration(
              color: RepickColors.blue,
              shape: BoxShape.circle,
            ),
            child: Text(
              _formatWeightValue(entry.weightKg),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                height: 1,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
          const SizedBox(height: 5),
          Text(
            '${entry.reps}X',
            style: const TextStyle(
              color: Color(0xFF697484),
              fontSize: 14,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

class _CalendarCell extends StatelessWidget {
  const _CalendarCell({
    required this.day,
    required this.count,
    required this.selected,
    required this.onTap,
  });

  final int day;
  final int count;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final trained = count > 0;
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: selected
              ? RepickColors.blue
              : trained
              ? RepickColors.paleBlue
              : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: selected
                ? RepickColors.blue
                : trained
                ? const Color(0x4D0A66D8)
                : RepickColors.line,
          ),
        ),
        child: Stack(
          children: [
            Center(
              child: Text(
                '$day',
                style: TextStyle(
                  color: selected
                      ? Colors.white
                      : trained
                      ? RepickColors.blue
                      : RepickColors.navy,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
            if (count > 0)
              Positioned(
                right: 4,
                bottom: 4,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 5,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: RepickColors.success,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    '$count',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _AvatarOptionCard extends StatelessWidget {
  const _AvatarOptionCard({
    required this.avatar,
    required this.selected,
    required this.unlocked,
    required this.onTap,
  });

  final AvatarCandidate avatar;
  final bool selected;
  final bool unlocked;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: selected ? RepickColors.blue : RepickColors.line,
            width: selected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Expanded(child: Image.asset(avatar.assetPath)),
            const SizedBox(height: 8),
            Text(
              avatar.name,
              style: const TextStyle(fontWeight: FontWeight.w900),
            ),
            Text(
              unlocked ? (selected ? '선택됨' : '선택 가능') : '${avatar.price}개 해금',
            ),
          ],
        ),
      ),
    );
  }
}

String _todayKey() => _dateKey(DateTime.now());

int _elapsedSeconds(DateTime? startedAt) {
  if (startedAt == null) {
    return 0;
  }
  return max(0, DateTime.now().difference(startedAt).inSeconds);
}

String _formatSeconds(int seconds) {
  final minutes = seconds ~/ 60;
  final restSeconds = seconds % 60;
  return '$minutes:${restSeconds.toString().padLeft(2, '0')}';
}

String _formatWorkoutDateLabel(String dateKey) {
  final date = DateTime.tryParse('${dateKey}T00:00:00') ?? DateTime.now();
  return '${date.month}월 ${date.day}일, 오후 운동';
}

String _formatShareDateTime(WorkoutSession session) {
  final date = session.finishedAt ?? session.startedAt;
  if (date == null) {
    return session.workoutDate.replaceAll('-', '.');
  }

  final year = date.year.toString().substring(2);
  final hour = date.hour.toString().padLeft(2, '0');
  final minute = date.minute.toString().padLeft(2, '0');
  return '$year.${date.month}.${date.day} · $hour:$minute';
}

String _shareWorkoutTitle(List<String> parts) {
  if (parts.isEmpty) {
    return '오늘 운동';
  }
  return parts.take(3).join(' · ');
}

String _formatWeightValue(num weight) {
  return weight % 1 == 0 ? '${weight.round()}' : weight.toStringAsFixed(1);
}

String _dateKey(DateTime date) {
  return '${date.year.toString().padLeft(4, '0')}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
}

String _comma(num value) {
  final text = value.round().toString();
  final buffer = StringBuffer();
  for (var index = 0; index < text.length; index++) {
    if (index > 0 && (text.length - index) % 3 == 0) {
      buffer.write(',');
    }
    buffer.write(text[index]);
  }
  return buffer.toString();
}
