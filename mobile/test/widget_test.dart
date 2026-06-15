// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:repick/src/core/api_client.dart';
import 'package:repick/src/core/local_store.dart';
import 'package:repick/src/shared/models.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:repick/src/app/repick_app.dart';

void main() {
  testWidgets('Repick app renders auth entry', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});

    await tester.pumpWidget(const RepickApp());

    await tester.pumpAndSettle();

    expect(find.text('Repick'), findsOneWidget);
  });

  testWidgets('Record tab opens exercise picker', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});

    const user = RepickUser(
      id: 'test-user',
      email: 'test@example.com',
      nickname: '테스터',
      displayName: '테스터',
      gender: Gender.male,
      workoutGoal: 'MUSCLE_GAIN',
      ageGroup: 'AGE_30S',
    );

    await tester.pumpWidget(
      MaterialApp(
        home: RepickShell(
          api: ApiClient(),
          store: LocalStore(),
          user: user,
          onLogout: () {},
        ),
      ),
    );

    await tester.pumpAndSettle();
    await tester.tap(find.text('기록'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('운동 추가'));
    await tester.pump(const Duration(milliseconds: 500));

    expect(find.textContaining('개의 운동 기구'), findsOneWidget);
  });
}
