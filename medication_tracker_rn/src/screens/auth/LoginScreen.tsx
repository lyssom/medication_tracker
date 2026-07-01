import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Icon,
} from 'react-native-paper';
import { useAuthStore } from '../../store/useAuthStore';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { login, register, isLoading } = useAuthStore();
  const [username, setUsername] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [password, setPassword] = useState('');
  const [invitation, setInvitation] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim()) {
      setError('请输入用户名');
      return;
    }

    setError('');

    try {
      if (isRegistering) {
        await register({
          username: username.trim(),
          password: password.trim(),
          invitation: invitation.trim(),
        });
      } else {
        await login({
        username: username.trim(),
        password: password.trim(),
      });
      }
      onLoginSuccess?.();
    } catch (err: any) {
      setError(err.message || '操作失败，请重试');
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setInvitation('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Logo 和标题 */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Icon source="pill" size={64} color="#10B981" />
          </View>
          <Text variant="headlineLarge" style={styles.title}>
            药伴
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            吃药不再是一个人的事
          </Text>
        </View>

        {/* 登录/注册表单 */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.formTitle}>
              {isRegistering ? '创建账户' : '欢迎回来'}
            </Text>

            <TextInput
              label="用户名"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setError('');
              }}
              style={styles.input}
              mode="outlined"
              autoCapitalize="none"
              autoCorrect={false}
              left={<TextInput.Icon icon="account" />}
              placeholder="请输入用户名"
            />

            <TextInput
              label="密码"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError('');
              }}
              style={styles.input}
              mode="outlined"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!showPassword}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              placeholder="请输入密码"
            />

            {isRegistering && (
              <TextInput
                label="邀请码"
                value={invitation}
                onChangeText={setInvitation}
                style={styles.input}
                mode="outlined"
                autoCapitalize="none"
                left={<TextInput.Icon icon="emoticon-happy-outline" />}
                placeholder=""
              />
            )}

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={styles.submitButton}
              contentStyle={styles.submitContent}
            >
              {isLoading
                ? '请稍候...'
                : isRegistering
                ? '注册并登录'
                : '登录'}
            </Button>

            <TouchableOpacity onPress={toggleMode} style={styles.toggleMode}>
              <Text variant="bodyMedium" style={styles.toggleText}>
                {isRegistering
                  ? '已有账户？点击登录'
                  : '没有账户？点击注册'}
              </Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* 底部说明 */}
        <Text variant="bodySmall" style={styles.footer}>
          {isRegistering
            ? '注册即表示您同意我们的服务条款'
            : '登录后可以管理药物并开启打卡'}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#10B98120',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  subtitle: {
    color: '#6B7280',
  },
  formCard: {
    elevation: 2,
    borderRadius: 16,
  },
  formTitle: {
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#10B981',
    marginTop: 8,
  },
  submitContent: {
    paddingVertical: 8,
  },
  toggleMode: {
    marginTop: 16,
    alignItems: 'center',
  },
  toggleText: {
    color: '#10B981',
  },
  footer: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 24,
  },
});

export default LoginScreen;
