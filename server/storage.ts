import { users, type User, type InsertUser, type Signature, type InsertSignature, type Settings, type InsertSettings } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Signature methods
  getSignature(id: number): Promise<Signature | undefined>;
  getSignaturesByUser(userId: number): Promise<Signature[]>;
  createSignature(signature: InsertSignature): Promise<Signature>;
  
  // Settings methods
  getSettings(userId: number): Promise<Settings | undefined>;
  createOrUpdateSettings(settings: InsertSettings): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private signatures: Map<number, Signature>;
  private settings: Map<number, Settings>;
  currentUserId: number;
  currentSignatureId: number;
  currentSettingsId: number;

  constructor() {
    this.users = new Map();
    this.signatures = new Map();
    this.settings = new Map();
    this.currentUserId = 1;
    this.currentSignatureId = 1;
    this.currentSettingsId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      address: insertUser.address || null,
      ensName: insertUser.ensName || null
    };
    this.users.set(id, user);
    return user;
  }
  
  // Signature methods
  async getSignature(id: number): Promise<Signature | undefined> {
    return this.signatures.get(id);
  }
  
  async getSignaturesByUser(userId: number): Promise<Signature[]> {
    return Array.from(this.signatures.values()).filter(
      (signature) => signature.userId === userId
    );
  }
  
  async createSignature(signature: InsertSignature): Promise<Signature> {
    const id = this.currentSignatureId++;
    const now = new Date();
    const newSignature: Signature = { 
      ...signature, 
      id,
      userId: signature.userId || null,
      timestamp: signature.timestamp || now,
      valid: signature.valid !== undefined ? signature.valid : true,
      documentHash: signature.documentHash || null,
      documentName: signature.documentName || null,
      signerEns: signature.signerEns || null
    };
    this.signatures.set(id, newSignature);
    return newSignature;
  }
  
  // Settings methods
  async getSettings(userId: number): Promise<Settings | undefined> {
    return Array.from(this.settings.values()).find(
      (setting) => setting.userId === userId
    );
  }
  
  async createOrUpdateSettings(settingsData: InsertSettings): Promise<Settings> {
    const existingSettings = await this.getSettings(settingsData.userId);
    
    if (existingSettings) {
      // Update existing settings
      const updatedSettings: Settings = { 
        ...existingSettings, 
        ...settingsData,
        theme: settingsData.theme || existingSettings.theme,
        autoConnect: settingsData.autoConnect !== undefined ? settingsData.autoConnect : existingSettings.autoConnect,
        preferredNetwork: settingsData.preferredNetwork || existingSettings.preferredNetwork,
        showTestnets: settingsData.showTestnets !== undefined ? settingsData.showTestnets : existingSettings.showTestnets,
        defaultMessageType: settingsData.defaultMessageType || existingSettings.defaultMessageType,
        signatureExpiration: settingsData.signatureExpiration !== undefined ? settingsData.signatureExpiration : existingSettings.signatureExpiration,
        displayEns: settingsData.displayEns !== undefined ? settingsData.displayEns : existingSettings.displayEns,
        backupFrequency: settingsData.backupFrequency || existingSettings.backupFrequency
      };
      this.settings.set(existingSettings.id, updatedSettings);
      return updatedSettings;
    } else {
      // Create new settings
      const id = this.currentSettingsId++;
      const newSettings: Settings = { 
        ...settingsData, 
        id,
        theme: settingsData.theme || "system",
        autoConnect: settingsData.autoConnect !== undefined ? settingsData.autoConnect : true,
        preferredNetwork: settingsData.preferredNetwork || "1",
        showTestnets: settingsData.showTestnets !== undefined ? settingsData.showTestnets : false,
        defaultMessageType: settingsData.defaultMessageType || "text",
        signatureExpiration: settingsData.signatureExpiration !== undefined ? settingsData.signatureExpiration : 30,
        displayEns: settingsData.displayEns !== undefined ? settingsData.displayEns : true,
        backupFrequency: settingsData.backupFrequency || "manual"
      };
      this.settings.set(id, newSettings);
      return newSettings;
    }
  }
}

export const storage = new MemStorage();
