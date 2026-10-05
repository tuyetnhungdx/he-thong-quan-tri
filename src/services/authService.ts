import { AppUser } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const CURRENT_USER_KEY = 'tro_ly_current_user';
const LOCAL_ACCOUNTS_KEY = 'tro_ly_user_accounts';

export interface StoredAccount {
  id: string;
  username: string;
  passwordHash: string; // Trong môi trường trình duyệt lưu hash/mã hóa đơn giản
  fullName: string;
  role: string;
  school: string;
  createdAt: string;
}

// Tài khoản mặc định ban đầu nếu chưa có tài khoản nào
const DEFAULT_ACCOUNTS: StoredAccount[] = [
  {
    id: 'user_co_nhung',
    username: 'conhung',
    passwordHash: '123456',
    fullName: 'Cô Trần Thị Tuyết Nhung',
    role: 'Giáo viên bộ môn Tin học',
    school: 'THPT Nguyễn Dục',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_admin',
    username: 'admin',
    passwordHash: '123456',
    fullName: 'Thầy Quản Trị Hệ Thống',
    role: 'Quản trị viên học tập',
    school: 'THPT Nguyễn Dục',
    createdAt: new Date().toISOString(),
  },
];

/**
 * Lấy danh sách tài khoản được lưu cục bộ
 */
function getLocalAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    const accounts = JSON.parse(raw);
    if (!Array.isArray(accounts) || accounts.length === 0) {
      localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    return accounts;
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

/**
 * Lưu danh sách tài khoản cục bộ
 */
function saveLocalAccounts(accounts: StoredAccount[]): void {
  try {
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Không thể lưu tài khoản vào localStorage:', err);
  }
}

/**
 * Lấy thông tin phiên đăng nhập hiện tại
 */
export function getCurrentUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppUser;
  } catch {
    return null;
  }
}

/**
 * Lưu phiên đăng nhập
 */
export function setCurrentUser(user: AppUser): void {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Không thể lưu phiên đăng nhập:', err);
  }
}

/**
 * Đăng xuất
 */
export function logoutUser(): void {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
  } catch (err) {
    console.error('Lỗi khi đăng xuất:', err);
  }
}

/**
 * Đăng nhập bằng Tên đăng nhập và Mật khẩu (Không cần Gmail)
 */
export async function loginWithUsername(
  usernameInput: string,
  passwordInput: string
): Promise<{ user?: AppUser; error?: string }> {
  const username = usernameInput.trim().toLowerCase();
  const password = passwordInput.trim();

  if (!username) {
    return { error: 'Vui lòng nhập tên đăng nhập.' };
  }
  if (!password) {
    return { error: 'Vui lòng nhập mật khẩu.' };
  }

  // 1. Kiểm tra trên Supabase trước (nếu đã kết nối và có bảng app_users)
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('username', username)
        .limit(1);

      if (!error && data && data.length > 0) {
        const remoteUser = data[0];
        if (remoteUser.password === password) {
          const appUser: AppUser = {
            id: remoteUser.id,
            username: remoteUser.username,
            fullName: remoteUser.full_name || remoteUser.username,
            role: remoteUser.role || 'Giáo viên bộ môn Tin học',
            school: remoteUser.school || 'THPT Nguyễn Dục',
            createdAt: remoteUser.created_at || new Date().toISOString(),
          };
          setCurrentUser(appUser);
          return { user: appUser };
        } else {
          return { error: 'Mật khẩu không chính xác. Vui lòng kiểm tra lại!' };
        }
      }
    } catch {
      // Nếu bảng Supabase chưa tạo hoặc lỗi mạng, chuyển tiếp kiểm tra ở bộ nhớ máy
    }
  }

  // 2. Kiểm tra trong danh sách tài khoản cục bộ
  const accounts = getLocalAccounts();
  const match = accounts.find((acc) => acc.username.toLowerCase() === username);

  if (!match) {
    return {
      error: `Tên đăng nhập "${usernameInput}" không tồn tại. Vui lòng kiểm tra lại hoặc chuyển sang tab Đăng ký!`,
    };
  }

  if (match.passwordHash !== password) {
    return { error: 'Mật khẩu không chính xác. Vui lòng thử lại!' };
  }

  const appUser: AppUser = {
    id: match.id,
    username: match.username,
    fullName: match.fullName,
    role: match.role,
    school: match.school,
    createdAt: match.createdAt,
  };

  setCurrentUser(appUser);
  return { user: appUser };
}

/**
 * Đăng ký tài khoản mới chỉ với Tên đăng nhập và Mật khẩu (Không cần Gmail)
 */
export async function registerWithUsername(
  usernameInput: string,
  passwordInput: string,
  fullNameInput: string,
  schoolInput: string = 'THPT Nguyễn Dục'
): Promise<{ user?: AppUser; error?: string }> {
  const username = usernameInput.trim().toLowerCase();
  const password = passwordInput.trim();
  const fullName = fullNameInput.trim();

  // Kiểm tra tính hợp lệ
  if (!username) {
    return { error: 'Vui lòng nhập tên đăng nhập.' };
  }
  if (username.length < 3) {
    return { error: 'Tên đăng nhập phải có ít nhất 3 ký tự.' };
  }
  if (!/^[a-z0-9_.-]+$/.test(username)) {
    return {
      error: 'Tên đăng nhập chỉ được chứa chữ cái không dấu (a-z), chữ số (0-9) và dấu gạch dưới (_).',
    };
  }
  if (!password) {
    return { error: 'Vui lòng nhập mật khẩu.' };
  }
  if (password.length < 4) {
    return { error: 'Mật khẩu phải có ít nhất 4 ký tự.' };
  }
  if (!fullName) {
    return { error: 'Vui lòng nhập Họ và tên giáo viên.' };
  }

  // 1. Kiểm tra xem tên đăng nhập đã được dùng chưa trên Supabase
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('id')
        .eq('username', username)
        .limit(1);

      if (!error && data && data.length > 0) {
        return { error: `Tên đăng nhập "${username}" đã có người sử dụng. Vui lòng chọn tên khác!` };
      }
    } catch {
      // Bỏ qua nếu bảng chưa tồn tại
    }
  }

  // 2. Kiểm tra xem tên đăng nhập đã tồn tại trong LocalStorage chưa
  const accounts = getLocalAccounts();
  const existsLocally = accounts.some((acc) => acc.username.toLowerCase() === username);
  if (existsLocally) {
    return { error: `Tên đăng nhập "${username}" đã có người đăng ký. Vui lòng chọn tên khác!` };
  }

  const newId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  const newAccount: StoredAccount = {
    id: newId,
    username,
    passwordHash: password,
    fullName,
    role: 'Giáo viên bộ môn Tin học',
    school: schoolInput || 'THPT Nguyễn Dục',
    createdAt: now,
  };

  // Lưu vào danh sách tài khoản cục bộ
  accounts.push(newAccount);
  saveLocalAccounts(accounts);

  // Thử đồng bộ lưu lên Supabase nếu có
  if (isSupabaseConfigured) {
    try {
      await supabase.from('app_users').insert([
        {
          id: newId,
          username,
          password,
          full_name: fullName,
          role: newAccount.role,
          school: newAccount.school,
          created_at: now,
        },
      ]);
    } catch {
      // Không chặn người dùng nếu bảng Supabase chưa tạo
    }
  }

  const appUser: AppUser = {
    id: newId,
    username,
    fullName,
    role: newAccount.role,
    school: newAccount.school,
    createdAt: now,
  };

  setCurrentUser(appUser);
  return { user: appUser };
}
