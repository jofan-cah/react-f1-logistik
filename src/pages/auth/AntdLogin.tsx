// src/pages/auth/AntdLogin.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Checkbox, Card, Typography, message, Spin, Divider } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

// Header component with logo
const AppHeader: React.FC = () => (
  <div className="flex justify-center mb-6">
    <div className="flex items-center">
      <div className="text-blue-600 mr-2 text-2xl">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 2L7 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M17 2L17 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M2 12L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M2 7L7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M2 17L7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M17 17L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M17 7L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <Title level={3} className="m-0">ISP Barcode System</Title>
    </div>
  </div>
);

// Login form component
const AntdLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  // Form submission handler
  const onFinish = async (values: { username: string; password: string }) => {
    try {
      const success = await login(values.username, values.password);
      
      if (success) {
        messageApi.success('Login successful!');
        navigate('/dashboard');
      } else {
        messageApi.error('Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      messageApi.error('An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      {contextHolder}
      
      <div className="w-full max-w-md">
        <Card 
          bordered={false} 
          className="shadow-xl rounded-lg overflow-hidden"
          bodyStyle={{ padding: '2rem' }}
        >
          <AppHeader />
          
          <div className="text-center mb-6">
            <Text type="secondary">Sign in to your account</Text>
          </div>
          
          <Form
            form={form}
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input 
                prefix={<UserOutlined className="text-gray-400" />} 
                placeholder="Username" 
                className="rounded-md py-2"
              />
            </Form.Item>
            
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password 
                prefix={<LockOutlined className="text-gray-400" />} 
                placeholder="Password" 
                className="rounded-md py-2"
              />
            </Form.Item>
            
            <Form.Item>
              <div className="flex justify-between items-center">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
                
                <a className="text-blue-600 hover:text-blue-800" href="#">
                  Forgot password?
                </a>
              </div>
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="w-full h-10 bg-blue-600 hover:bg-blue-700"
                icon={loading ? <Spin size="small" /> : <LoginOutlined />}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </Form.Item>
          </Form>
          
          <Divider plain>
            <Text type="secondary" className="text-xs">DEMO ACCOUNT</Text>
          </Divider>
          
          <div className="text-center mb-2">
            <Text className="block text-sm text-gray-500">Username: <Text strong>admin</Text></Text>
            <Text className="block text-sm text-gray-500">Password: <Text strong>admin123</Text></Text>
          </div>
          
          <div className="text-center mt-4">
            <Text type="secondary" className="text-xs">
              © {new Date().getFullYear()} ISP Barcode System. All rights reserved.
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AntdLogin;