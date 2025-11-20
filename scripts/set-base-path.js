// 빌드 전 BASE_PATH 및 NODE_ENV 환경 변수 자동 설정
// BASE_PATH가 있으면 배포 환경(production), 없으면 개발 환경(development)

import { execSync } from 'child_process';

const getRepoName = () => {
  try {
    const gitUrl = execSync('git remote get-url origin', { encoding: 'utf8', stdio: 'pipe' }).trim();
    const match = gitUrl.match(/(?:github\.com[/:]|github\.com\/)([^/]+)\/([^/]+?)(?:\.git)?$/);
    if (match) {
      return match[2];
    }
  } catch (error) {
    // Git이 없거나 리포지토리가 아닌 경우 무시
  }
  return null;
};

// BASE_PATH 설정
const repoName = getRepoName();
if (repoName && !process.env.BASE_PATH) {
  process.env.BASE_PATH = `/${repoName}`;
  console.log(`✅ BASE_PATH 자동 설정: /${repoName}`);
}

// BASE_PATH로 NODE_ENV 자동 설정
if (!process.env.NODE_ENV) {
  const hasBasePath = !!process.env.BASE_PATH;
  process.env.NODE_ENV = hasBasePath ? 'production' : 'development';
  console.log(`✅ NODE_ENV 자동 설정: ${process.env.NODE_ENV} (BASE_PATH: ${process.env.BASE_PATH || '없음'})`);
}

