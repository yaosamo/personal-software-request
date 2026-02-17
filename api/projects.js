module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const username = (process.env.GITHUB_USERNAME || "yaosamo").trim();

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=24&type=owner`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "personal-software-request"
        }
      }
    );

    if (!response.ok) {
      return res.status(502).json({ error: "Failed to load projects" });
    }

    const repos = await response.json();
    const projects = repos
      .filter((repo) => !repo.fork)
      .slice(0, 8)
      .map((repo) => ({
        name: repo.name,
        description: repo.description || "No description",
        url: repo.html_url,
        updatedAt: repo.updated_at
      }));

    return res.status(200).json({ projects });
  } catch (error) {
    return res.status(502).json({ error: "Project feed unavailable" });
  }
};
