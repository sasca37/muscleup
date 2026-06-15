import 'package:shared_preferences/shared_preferences.dart';

import '../shared/models.dart';

class LocalStore {
  static const _sessionKey = 'repick-mock-session';
  static const _lastLoginEmailKey = 'repick-last-login-email';
  static const _avatarSelectionKeyPrefix = 'repick-avatar-selection';
  static const _shopStateKeyPrefix = 'repick-shop-state';

  Future<RepickUser?> loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    return RepickUser.decode(prefs.getString(_sessionKey));
  }

  Future<void> saveUser(RepickUser user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_sessionKey, user.encode());
  }

  Future<String?> loadLastLoginEmail() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_lastLoginEmailKey);
  }

  Future<void> saveLastLoginEmail(String email) async {
    final normalizedEmail = email.trim();
    if (normalizedEmail.isEmpty) {
      return;
    }

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_lastLoginEmailKey, normalizedEmail);
  }

  Future<void> clearUser() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_sessionKey);
  }

  Future<String?> loadAvatarId(String userId) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('$_avatarSelectionKeyPrefix:$userId');
  }

  Future<void> saveAvatarId(String userId, String avatarId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('$_avatarSelectionKeyPrefix:$userId', avatarId);
  }

  Future<ShopState> loadShopState(String userId) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('$_shopStateKeyPrefix:$userId');
    return ShopState.decode(raw);
  }

  Future<void> saveShopState(String userId, ShopState state) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('$_shopStateKeyPrefix:$userId', state.encode());
  }
}
