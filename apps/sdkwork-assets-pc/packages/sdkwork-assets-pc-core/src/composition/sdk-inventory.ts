export function listSdkworkCoreSdkInventory() {
  return [
    {
      workspace: '@sdkwork/drive-app-sdk',
      surface: 'app-api',
      credentialMode: 'authenticated-app-api',
    },
    {
      workspace: '@sdkwork/iam-app-sdk',
      surface: 'app-api',
      credentialMode: 'authenticated-app-api',
    },
    {
      workspace: 'sdkwork-drive-app-sdk',
      surface: 'app-api',
      credentialMode: 'authenticated-app-api',
    },
    {
      workspace: 'sdkwork-iam-app-sdk',
      surface: 'app-api',
      credentialMode: 'authenticated-app-api',
    },
  ] as const;
}
