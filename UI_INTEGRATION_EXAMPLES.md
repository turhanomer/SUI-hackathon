# UI Entegrasyonu - Kullanım Örnekleri

Bu dosya, Move kontratlarının UI bileşenlerinde nasıl kullanılacağını gösterir.

## Hook Kullanımı

### Profil Oluşturma Örneği

```tsx
import { useSuiContracts } from "../utility/useSuiContracts";
import { useState } from "react";

function CreateProfileComponent() {
  const { createProfile, isLoading, error } = useSuiContracts();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await createProfile({
      username,
      bio,
    });

    if (result) {
      alert("Profil oluşturuldu!");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Kullanıcı adı"
        required
      />
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Bio"
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Oluşturuluyor..." : "Profil Oluştur"}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
```

### Anket Oluşturma Örneği

```tsx
import { useSuiContracts } from "../utility/useSuiContracts";
import { useState } from "react";

function CreateSurveyComponent() {
  const { createSurvey, getUserBadges, isLoading } = useSuiContracts();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([
    {
      prompt: "",
      options: ["", ""],
      allows_multiple: false,
      max_selections: 1,
    },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Badge kontrolü (opsiyonel)
    const badges = await getUserBadges();
    
    const result = await createSurvey({
      title,
      description,
      questions,
    });

    if (result) {
      alert("Anket oluşturuldu!");
      // Redirect to polls page
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        prompt: "",
        options: ["", ""],
        allows_multiple: false,
        max_selections: 1,
      },
    ]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Anket başlığı"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Açıklama"
      />

      <h3>Sorular</h3>
      {questions.map((q, idx) => (
        <div key={idx} className="question">
          <input
            value={q.prompt}
            onChange={(e) => updateQuestion(idx, "prompt", e.target.value)}
            placeholder={`Soru ${idx + 1}`}
            required
          />
          
          {q.options.map((opt, optIdx) => (
            <input
              key={optIdx}
              value={opt}
              onChange={(e) => {
                const newOptions = [...q.options];
                newOptions[optIdx] = e.target.value;
                updateQuestion(idx, "options", newOptions);
              }}
              placeholder={`Seçenek ${optIdx + 1}`}
              required
            />
          ))}

          <label>
            <input
              type="checkbox"
              checked={q.allows_multiple}
              onChange={(e) =>
                updateQuestion(idx, "allows_multiple", e.target.checked)
              }
            />
            Çoklu seçim
          </label>
        </div>
      ))}

      <button type="button" onClick={addQuestion}>
        Soru Ekle
      </button>

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Oluşturuluyor..." : "Anket Oluştur"}
      </button>
    </form>
  );
}
```

### Ankete Cevap Verme Örneği

```tsx
import { useSuiContracts } from "../utility/useSuiContracts";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function VoteSurveyComponent() {
  const { id } = useParams<{ id: string }>();
  const { getSurvey, submitResponse, getUserProfile, isLoading } = useSuiContracts();
  
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState<{
    question_index: number;
    selected_option_indices: number[];
    free_text?: string;
  }[]>([]);

  useEffect(() => {
    if (id) {
      loadSurvey();
    }
  }, [id]);

  const loadSurvey = async () => {
    const data = await getSurvey(id!);
    if (data) {
      setSurvey(data);
      // Initialize answers
      setAnswers(
        data.questions.map((_, idx) => ({
          question_index: idx,
          selected_option_indices: [],
        }))
      );
    }
  };

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    const newAnswers = [...answers];
    const question = survey.questions[questionIdx];
    
    if (question.allows_multiple) {
      // Çoklu seçim
      const current = newAnswers[questionIdx].selected_option_indices;
      if (current.includes(optionIdx)) {
        newAnswers[questionIdx].selected_option_indices = current.filter(
          (i) => i !== optionIdx
        );
      } else {
        newAnswers[questionIdx].selected_option_indices.push(optionIdx);
      }
    } else {
      // Tekli seçim
      newAnswers[questionIdx].selected_option_indices = [optionIdx];
    }
    
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kullanıcının profilini al (stats_id için)
    const profile = await getUserProfile();
    if (!profile) {
      alert("Önce profil oluşturmalısınız!");
      return;
    }

    const result = await submitResponse(
      {
        surveyId: id!,
        answers,
      },
      profile.stats_id
    );

    if (result) {
      alert("Cevabınız kaydedildi!");
      // Redirect to results page
    }
  };

  if (!survey) return <div>Yükleniyor...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <h1>{survey.title}</h1>
      <p>{survey.description}</p>

      {survey.questions.map((question, qIdx) => (
        <div key={qIdx} className="question">
          <h3>{question.prompt}</h3>
          
          {question.options.map((option, oIdx) => (
            <label key={oIdx}>
              <input
                type={question.allows_multiple ? "checkbox" : "radio"}
                checked={answers[qIdx].selected_option_indices.includes(oIdx)}
                onChange={() => handleSelectOption(qIdx, oIdx)}
              />
              {option}
            </label>
          ))}
        </div>
      ))}

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Gönderiliyor..." : "Cevapları Gönder"}
      </button>
    </form>
  );
}
```

### Profil Sayfası Örneği

```tsx
import { useSuiContracts } from "../utility/useSuiContracts";
import { useState, useEffect } from "react";

function ProfilePage() {
  const { 
    account, 
    getUserProfile, 
    getUserSurveys, 
    getUserBadges 
  } = useSuiContracts();
  
  const [profile, setProfile] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    if (account) {
      loadProfileData();
    }
  }, [account]);

  const loadProfileData = async () => {
    const [profileData, surveysData, badgesData] = await Promise.all([
      getUserProfile(),
      getUserSurveys(),
      getUserBadges(),
    ]);

    if (profileData) setProfile(profileData);
    setSurveys(surveysData);
    setBadges(badgesData);
  };

  if (!account) {
    return <div>Lütfen cüzdan bağlayın</div>;
  }

  if (!profile) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>{profile.username}</h1>
        <p>{profile.bio}</p>
      </div>

      <div className="badges">
        <h2>Badge'ler</h2>
        {badges.map((badge) => (
          <div key={badge.id} className="badge">
            <img src={badge.image_url} alt={badge.name} />
            <h3>{badge.name}</h3>
            <p>{badge.description}</p>
            <span>Tier: {badge.tier}</span>
          </div>
        ))}
      </div>

      <div className="surveys">
        <h2>Oluşturduğum Anketler</h2>
        {surveys.map((survey) => (
          <div key={survey.id} className="survey-card">
            <h3>{survey.title}</h3>
            <p>{survey.description}</p>
            <span>{survey.participant_count} katılımcı</span>
            <span>{survey.is_open ? "Açık" : "Kapalı"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Önemli Notlar

1. **Deploy önce**: Move kontratlarını deploy ettikten sonra `networkConfig.ts` dosyasındaki ID'leri güncelleyin.

2. **Error handling**: Her işlem için error handling ekleyin.

3. **Loading states**: Transaction'lar zaman alabilir, kullanıcıya feedback verin.

4. **Wallet bağlantısı**: Transaction göndermeden önce wallet'ın bağlı olduğunu kontrol edin.

5. **Gas fees**: Kullanıcının yeterli SUI token'ı olduğundan emin olun.

## Geliştirme Süreci

1. `npm install` ile bağımlılıkları yükleyin
2. Move kontratları deploy edin
3. `networkConfig.ts`'i güncelleyin
4. `npm run dev` ile geliştirme sunucusunu başlatın
5. Tarayıcıda test edin

## Transaction İzleme

Her başarılı transaction için digest alırsınız. Bunu explorer'da görmek için:

```
https://suiexplorer.com/txblock/[DIGEST]?network=testnet
```
