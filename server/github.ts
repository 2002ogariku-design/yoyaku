import { Octokit } from "octokit";
import type { Item } from "../client/src/types";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = "2002ogariku-design";
const REPO_NAME = "yoyaku";
const DATA_FILE = "data.json";

if (!GITHUB_TOKEN) {
  console.warn("[GitHub] GITHUB_TOKEN not set");
}

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

export async function saveItemsToGitHub(userId: string, items: Item[]): Promise<boolean> {
  try {
    if (!GITHUB_TOKEN) {
      console.warn("[GitHub] Cannot save: GITHUB_TOKEN not set");
      return false;
    }

    const filePath = `data/${userId}/${DATA_FILE}`;
    const content = Buffer.from(JSON.stringify(items, null, 2)).toString("base64");

    // ファイルが既に存在するか確認
    let sha: string | undefined;
    try {
      const response = await octokit.rest.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: filePath,
      });
      
      if ("sha" in response.data) {
        sha = response.data.sha;
      }
    } catch (error: unknown) {
      // ファイルが存在しない場合はスキップ
      if ((error as { status?: number }).status !== 404) {
        throw error;
      }
    }

    // ファイルを作成または更新
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: filePath,
      message: `Update items for user ${userId}`,
      content,
      ...(sha && { sha }),
    });

    console.log(`[GitHub] Saved items for user ${userId}`);
    return true;
  } catch (error) {
    console.error("[GitHub] Failed to save items:", error);
    return false;
  }
}

export async function loadItemsFromGitHub(userId: string): Promise<Item[] | null> {
  try {
    if (!GITHUB_TOKEN) {
      console.warn("[GitHub] Cannot load: GITHUB_TOKEN not set");
      return null;
    }

    const filePath = `data/${userId}/${DATA_FILE}`;

    const response = await octokit.rest.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: filePath,
    });

    if ("content" in response.data && typeof response.data.content === "string") {
      const content = Buffer.from(response.data.content, "base64").toString("utf-8");
      const items = JSON.parse(content) as Item[];
      console.log(`[GitHub] Loaded ${items.length} items for user ${userId}`);
      return items;
    }

    return null;
  } catch (error: unknown) {
    if ((error as { status?: number }).status === 404) {
      console.log(`[GitHub] No data found for user ${userId}`);
      return null;
    }
    console.error("[GitHub] Failed to load items:", error);
    return null;
  }
}

export async function deleteItemsFromGitHub(userId: string): Promise<boolean> {
  try {
    if (!GITHUB_TOKEN) {
      console.warn("[GitHub] Cannot delete: GITHUB_TOKEN not set");
      return false;
    }

    const filePath = `data/${userId}/${DATA_FILE}`;

    // ファイルの情報を取得
    const response = await octokit.rest.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: filePath,
    });

    if ("sha" in response.data) {
      await octokit.rest.repos.deleteFile({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: filePath,
        message: `Delete items for user ${userId}`,
        sha: response.data.sha,
      });

      console.log(`[GitHub] Deleted items for user ${userId}`);
      return true;
    }

    return false;
  } catch (error: unknown) {
    if ((error as { status?: number }).status === 404) {
      console.log(`[GitHub] No data to delete for user ${userId}`);
      return true;
    }
    console.error("[GitHub] Failed to delete items:", error);
    return false;
  }
}
