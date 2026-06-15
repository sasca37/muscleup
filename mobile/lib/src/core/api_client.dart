import 'dart:convert';

import 'package:http/http.dart' as http;

import '../shared/models.dart';

class ApiClient {
  ApiClient({http.Client? httpClient, String? baseUrl})
    : _httpClient = httpClient ?? http.Client(),
      baseUrl =
          baseUrl ??
          const String.fromEnvironment(
            'API_BASE_URL',
            defaultValue: 'http://localhost:8080',
          );

  final http.Client _httpClient;
  final String baseUrl;

  Future<RepickUser> login({
    required String email,
    required String password,
  }) async {
    final json = await _requestJson(
      '/api/users/login',
      method: 'POST',
      body: {'email': email, 'password': password},
    );
    return RepickUser.fromJson(json);
  }

  Future<RepickUser> register({
    required String email,
    required String password,
    required String nickname,
    required Gender gender,
    required String workoutGoal,
    required String ageGroup,
  }) async {
    final json = await _requestJson(
      '/api/users/register',
      method: 'POST',
      body: {
        'email': email,
        'password': password,
        'nickname': nickname,
        'gender': gender.apiValue,
        'workoutGoal': workoutGoal,
        'ageGroup': ageGroup,
      },
    );
    return RepickUser.fromJson(json);
  }

  Future<List<ExerciseMachine>> listExercises(String userId) async {
    final json = await _requestList('/api/exercises', userId: userId);
    return json
        .whereType<Map<String, dynamic>>()
        .map(ExerciseMachine.fromJson)
        .where((exercise) => exercise.id > 0)
        .toList();
  }

  Future<List<WorkoutSession>> listWorkoutSessions(String userId) async {
    final json = await _requestList(
      '/api/workout-sessions?limit=60',
      userId: userId,
    );
    return json
        .whereType<Map<String, dynamic>>()
        .map(WorkoutSession.fromJson)
        .toList();
  }

  Future<WorkoutSession> startWorkoutSession(
    String userId,
    String workoutDate,
  ) async {
    final json = await _requestJson(
      '/api/workout-sessions/start',
      userId: userId,
      method: 'POST',
      body: {'workoutDate': workoutDate},
    );
    return WorkoutSession.fromJson(json);
  }

  Future<WorkoutSession> addWorkoutRecord({
    required String userId,
    required String sessionId,
    required int catalogId,
    required List<WorkoutSetEntry> sets,
    String? note,
  }) async {
    final json = await _requestJson(
      '/api/workout-sessions/$sessionId/records',
      userId: userId,
      method: 'POST',
      body: {
        'catalogId': catalogId,
        'note': note,
        'sets': sets.map((set) => set.toRecordPayload()).toList(),
      },
    );
    return WorkoutSession.fromJson(json);
  }

  Future<WorkoutSession> finishWorkoutSession(
    String userId,
    String sessionId,
  ) async {
    final json = await _requestJson(
      '/api/workout-sessions/$sessionId/finish',
      userId: userId,
      method: 'PATCH',
    );
    return WorkoutSession.fromJson(json);
  }

  Future<void> deleteWorkoutSession(String userId, String sessionId) async {
    await _send(
      '/api/workout-sessions/$sessionId',
      userId: userId,
      method: 'DELETE',
    );
  }

  Future<Map<String, dynamic>> _requestJson(
    String path, {
    String method = 'GET',
    String? userId,
    Map<String, dynamic>? body,
  }) async {
    final response = await _send(
      path,
      method: method,
      userId: userId,
      body: body,
    );
    if (response.body.isEmpty) {
      return {};
    }
    return jsonDecode(utf8.decode(response.bodyBytes)) as Map<String, dynamic>;
  }

  Future<List<dynamic>> _requestList(
    String path, {
    String method = 'GET',
    String? userId,
    Map<String, dynamic>? body,
  }) async {
    final response = await _send(
      path,
      method: method,
      userId: userId,
      body: body,
    );
    if (response.body.isEmpty) {
      return [];
    }
    return jsonDecode(utf8.decode(response.bodyBytes)) as List<dynamic>;
  }

  Future<http.Response> _send(
    String path, {
    required String method,
    String? userId,
    Map<String, dynamic>? body,
  }) async {
    final uri = Uri.parse('$baseUrl$path');
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (userId != null) {
      headers['X-User-Id'] = userId;
    }

    final response = switch (method) {
      'POST' => await _httpClient.post(
        uri,
        headers: headers,
        body: jsonEncode(body ?? {}),
      ),
      'PATCH' => await _httpClient.patch(
        uri,
        headers: headers,
        body: body == null ? null : jsonEncode(body),
      ),
      'DELETE' => await _httpClient.delete(uri, headers: headers),
      _ => await _httpClient.get(uri, headers: headers),
    };

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response;
    }

    throw ApiException(_parseErrorMessage(response));
  }

  String _parseErrorMessage(http.Response response) {
    try {
      final json =
          jsonDecode(utf8.decode(response.bodyBytes)) as Map<String, dynamic>;
      return json['message']?.toString() ??
          'API 요청에 실패했습니다. (${response.statusCode})';
    } catch (_) {
      return 'API 요청에 실패했습니다. (${response.statusCode})';
    }
  }
}

class ApiException implements Exception {
  const ApiException(this.message);

  final String message;

  @override
  String toString() => message;
}
