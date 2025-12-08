import React, { useState } from 'react';
import { apiClient } from '@shared/api/client';

const ApiTestComponent = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testRuleTemplates = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing /api/rule-templates endpoint...');
      const response = await apiClient.get('/api/rule-templates');
      console.log('✅ Success:', response);
      setResult({ success: true, data: response });
    } catch (error) {
      console.error('❌ Error:', error);
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testBusinessRules = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing /api/business/rules endpoint...');
      const response = await apiClient.get('/api/business/rules');
      console.log('✅ Success:', response);
      setResult({ success: true, data: response });
    } catch (error) {
      console.error('❌ Error:', error);
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    const localToken = localStorage.getItem('bc_auth_token');
    const sessionToken = sessionStorage.getItem('bc_auth_token');
    
    console.log('🔍 Auth Check:');
    console.log('  - localStorage:', localToken ? `${localToken.substring(0, 20)}...` : 'NO TOKEN');
    console.log('  - sessionStorage:', sessionToken ? `${sessionToken.substring(0, 20)}...` : 'NO TOKEN');
    
    const authToken = await apiClient.getAuthToken();
    console.log('  - ApiClient getAuthToken:', authToken ? `${authToken.substring(0, 20)}...` : 'NO TOKEN');

    setResult({
      success: true,
      data: {
        localStorage: !!localToken,
        sessionStorage: !!sessionToken,
        apiClientToken: !!authToken,
        tokenMatch: (localToken || sessionToken) === authToken
      }
    });
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">API Test Component</h3>
      
      <div className="space-y-2 mb-4">
        <button 
          onClick={checkAuth}
          className="px-4 py-2 bg-blue-600 text-white rounded mr-2 hover:bg-blue-700"
          disabled={loading}
        >
          Check Auth
        </button>
        
        <button 
          onClick={testRuleTemplates}
          className="px-4 py-2 bg-green-600 text-white rounded mr-2 hover:bg-green-700"
          disabled={loading}
        >
          Test Rule Templates
        </button>
        
        <button 
          onClick={testBusinessRules}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          disabled={loading}
        >
          Test Business Rules
        </button>
      </div>

      {loading && (
        <div className="text-blue-600">Loading...</div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-white rounded border">
          <h4 className="font-semibold mb-2">
            Result: {result.success ? '✅ Success' : '❌ Error'}
          </h4>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiTestComponent;