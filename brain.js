const { useState, useRef } = React;

function FaceRatingApp() {
  const criteria = [
    {
      key: "eyeArea",
      label: "Eye Area",
      description: "Shape, spacing, openness, and overall impact of the eyes.",
      tips: [
        "Use softer front lighting to make the eye area look clearer.",
        "Take the photo at eye level for better eye proportions.",
        "A relaxed expression can improve the eye area."
      ]
    },
    {
      key: "eyebrows",
      label: "Eyebrows",
      description: "Thickness, shape, symmetry, and how they frame the face.",
      tips: [
        "Tidier shaping can make eyebrows frame the face better.",
        "Use a sharper photo so eyebrow detail is more visible.",
        "A slightly raised angle can help eyebrow definition."
      ]
    },
    {
      key: "cheekbones",
      label: "Cheekbones",
      description: "Prominence and contribution to facial structure.",
      tips: [
        "Side lighting can help cheekbone structure stand out.",
        "A slight three-quarter angle often shows better definition.",
        "Keep the chin slightly forward for stronger facial structure."
      ]
    },
    {
      key: "harmony",
      label: "Harmony",
      description: "How balanced and proportionate the features look together.",
      tips: [
        "Use a centered photo with the full face visible.",
        "Avoid camera angles that distort facial proportions.",
        "Neutral lighting gives a more balanced impression."
      ]
    },
    {
      key: "dimorphism",
      label: "Dimorphism",
      description: "How strongly masculine or feminine traits show.",
      tips: [
        "Use a hairstyle that highlights your natural facial traits.",
        "Choose a clearer angle showing more of the facial structure.",
        "Sharper photo quality helps this category read better."
      ]
    },
    {
      key: "hairline",
      label: "Hairline",
      description: "Shape, visibility, and how it complements the face.",
      tips: [
        "Show the forehead more clearly in the photo.",
        "Avoid shadows over the hairline area.",
        "Better lighting helps the hairline look cleaner."
      ]
    }
  ];

  const weights = {
    eyeArea: 1,
    eyebrows: 1,
    cheekbones: 1,
    harmony: 1.4,
    dimorphism: 1,
    hairline: 0.8
  };

  const getDefaultScores = () =>
    criteria.reduce((acc, item) => {
      acc[item.key] = 5;
      return acc;
    }, {});

  const [scores, setScores] = useState(getDefaultScores());
  const [imageUrl, setImageUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fileInputRef = useRef(null);

  const totalWeight = Object.values(weights).reduce((sum, value) => sum + value, 0);

  const overallScore = (
    criteria.reduce((sum, item) => sum + scores[item.key] * weights[item.key], 0) / totalWeight
  ).toFixed(1);

  const strongest = [...criteria]
    .sort((a, b) => scores[b.key] - scores[a.key])
    .slice(0, 2);

  const weakest = [...criteria]
    .sort((a, b) => scores[a.key] - scores[b.key])
    .slice(0, 3);

  const getRatingText = (score) => {
    const value = Number(score);
    if (value >= 9) return "Exceptional";
    if (value >= 8) return "Very Strong";
    if (value >= 7) return "Strong";
    if (value >= 6) return "Above Average";
    if (value >= 5) return "Average";
    if (value >= 4) return "Below Average";
    return "Needs Improvement";
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setImageUrl(result);
      setImageName(file.name || "Selected photo");
      setHasAnalyzed(false);
      setShowResult(false);
      setScores(getDefaultScores());
    };

    reader.readAsDataURL(file);
  };

  const generateStarterScores = (nameSeed) => {
    const seed = Array.from(nameSeed || "photo")
      .reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);

    return criteria.reduce((acc, item, index) => {
      const raw = 4.8 + (((seed + index * 37) % 34) / 10);
      const clamped = Math.max(4.2, Math.min(8.1, Number(raw.toFixed(1))));
      acc[item.key] = clamped;
      return acc;
    }, {});
  };

  const analyzePhoto = () => {
    if (!imageUrl) return;

    setIsAnalyzing(true);

    setTimeout(() => {
      const generated = generateStarterScores(imageName);
      setScores(generated);
      setHasAnalyzed(true);
      setIsAnalyzing(false);
    }, 900);
  };

  const handleSliderChange = (key, value) => {
    setScores((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const resetAll = () => {
    setScores(getDefaultScores());
    setShowResult(false);
    setImageUrl("");
    setImageName("");
    setHasAnalyzed(false);
    setIsAnalyzing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const improvementComments = weakest.map((item) => ({
    ...item,
    score: scores[item.key],
    tip: item.tips[Math.round(scores[item.key]) % item.tips.length]
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-5 sm:px-5">
        <div className="mb-5 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
          <div className="mb-2 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium tracking-wide text-cyan-200">
            Mobile Face Rating App
          </div>
          <h1 className="text-2xl font-bold leading-tight">Photo Face Rating</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Upload a photo, analyze it, adjust the sliders, and get your final result.
          </p>
        </div>

        <div className="mb-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Your Photo</h2>
              <p className="mt-1 text-sm text-slate-300">Use camera or import from gallery.</p>
            </div>
            {imageUrl && (
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                Photo ready
              </span>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleFileChange}
          />

          {!imageUrl ? (
            <button
              onClick={triggerFilePicker}
              className="flex min-h-[260px] w-full flex-col items-center justify-center rounded-[2rem] border border-dashed border-cyan-400/30 bg-slate-950/50 px-5 text-center transition active:scale-[0.99]"
            >
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/10 text-2xl">
                📷
              </div>
              <p className="text-base font-semibold text-white">Capture or Import Photo</p>
              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
                On mobile, this opens the front camera or gallery so you can add your photo.
              </p>
            </button>
          ) : (
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black">
              <img
                src={imageUrl}
                alt="Selected face"
                className="block h-[260px] w-full object-cover"
              />
              <div className="p-3 text-sm text-slate-300 truncate">{imageName}</div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={triggerFilePicker}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.98]"
            >
              {imageUrl ? "Change Photo" : "Choose Photo"}
            </button>

            <button
              onClick={analyzePhoto}
              disabled={!imageUrl || isAnalyzing}
              className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Photo"}
            </button>
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-400">
            The preview is only for display. You can still fine-tune every rating manually.
          </p>
        </div>

        <div className="space-y-4">
          {criteria.map((item) => (
            <div
              key={item.key}
              className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">{item.label}</h2>
                  <p className="mt-1 text-sm leading-5 text-slate-300">{item.description}</p>
                </div>
                <div className="rounded-2xl bg-slate-800 px-3 py-2 text-sm font-bold text-cyan-300 shadow-inner">
                  {scores[item.key].toFixed(1)}
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={scores[item.key]}
                onChange={(e) => handleSliderChange(item.key, e.target.value)}
                disabled={!imageUrl}
                className="h-2 w-full cursor-pointer accent-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
              />

              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 mt-6 pb-2 pt-4">
          <div className="rounded-3xl border border-white/10 bg-slate-950/85 p-4 shadow-2xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Live overall</p>
                <p className="mt-1 text-2xl font-bold text-cyan-300">{overallScore}/10</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">{getRatingText(overallScore)}</p>
                <p className="text-xs text-slate-400">{imageUrl ? "Photo loaded" : "Add photo first"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowResult(true)}
                disabled={!imageUrl}
                className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
              >
                Show Result
              </button>
              <button
                onClick={resetAll}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.98]"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {showResult && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 sm:items-center">
            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-[2rem] rounded-b-none border border-white/10 bg-slate-900 p-5 shadow-2xl sm:rounded-[2rem]">
              <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-slate-700 sm:hidden" />

              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Final Result</p>
                  <h3 className="mt-2 text-2xl font-bold">{overallScore}/10</h3>
                  <p className="mt-1 text-sm text-slate-300">{getRatingText(overallScore)}</p>
                </div>
                <button
                  onClick={() => setShowResult(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200"
                >
                  Close
                </button>
              </div>

              {imageUrl && (
                <div className="mb-4 overflow-hidden rounded-3xl border border-white/10 bg-black">
                  <img
                    src={imageUrl}
                    alt="Analyzed face"
                    className="block h-[220px] w-full object-cover"
                  />
                </div>
              )}

              <div className="mb-4 rounded-3xl bg-white/5 p-4">
                <p className="text-sm text-slate-300">Summary</p>
                <p className="mt-2 text-sm leading-6 text-white">
                  Based on the current criteria ratings, the face scores{" "}
                  <span className="font-bold text-cyan-300">{overallScore}/10</span> overall.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-emerald-400/10 p-4">
                  <p className="text-sm font-semibold text-emerald-300">Strongest Areas</p>
                  <ul className="mt-2 space-y-2 text-sm text-slate-200">
                    {strongest.map((item) => (
                      <li key={item.key} className="flex items-center justify-between rounded-2xl bg-black/10 px-3 py-2">
                        <span>{item.label}</span>
                        <span className="font-bold">{scores[item.key].toFixed(1)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-3xl border border-white/10 bg-amber-400/10 p-4">
                  <p className="text-sm font-semibold text-amber-300">Areas to Improve for a 10</p>
                  <ul className="mt-2 space-y-3 text-sm text-slate-200">
                    {improvementComments.map((item) => (
                      <li key={item.key} className="rounded-2xl bg-black/10 px-3 py-3">
                        <div className="mb-1 flex items-center justify-between gap-3">
                          <span className="font-semibold">{item.label}</span>
                          <span className="font-bold text-amber-300">{item.score.toFixed(1)}</span>
                        </div>
                        <p className="text-xs leading-5 text-slate-300">{item.tip}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {hasAnalyzed && (
                <div className="mt-4 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm leading-6 text-cyan-100">
                  Starter scores were generated after photo upload, and all values remain editable.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<FaceRatingApp />);