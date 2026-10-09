defmodule Scai.Corpus do
  @moduledoc """
  Seed corpus for the spatial / geo-aware problem.
  Citation counts are illustrative seed figures, not live index counts.
  """

  @problem %{
    id: "geo-index",
    name: "Federated geo-local index",
    scope: "Satellite embeddings, census, and paper claims kept consistent at district scale.",
    why: "India-scale geospatial AI fails when models, surveys, and papers disagree and cannot be joined.",
    success: "A concept graph where every claim cites a span, and one gap exports to a brief."
  }

  def problem, do: @problem

  def concepts do
    [
      %{id: "foundation-model", name: "Foundation model", definition: "A pretrained representation reused across geospatial tasks.", parent: nil},
      %{id: "self-supervised", name: "Self-supervised pretraining", definition: "Masked or contrastive training on unlabeled imagery.", parent: "foundation-model"},
      %{id: "multispectral", name: "Multispectral", definition: "Bands beyond RGB, including Sentinel-2 and HLS.", parent: "foundation-model"},
      %{id: "change-detection", name: "Change detection", definition: "Identifying what changed between two dates.", parent: nil},
      %{id: "population", name: "Population mapping", definition: "Estimating people per cell from imagery and surveys.", parent: nil},
      %{id: "data-fusion", name: "Data fusion", definition: "Joining optical, radar, census, and text claims.", parent: nil},
      %{id: "federated-index", name: "Federated index", definition: "A source index that stays consistent across geo-local nodes.", parent: "data-fusion"}
    ]
  end

  def concept(id), do: Enum.find(concepts(), &(&1.id == id))

  def gaps do
    [
      %{
        id: "india-coverage",
        problem_id: "geo-index",
        question: "Where is India actually evaluated, versus US and EU tiles?",
        reason: "single-paper",
        next: "Re-score the seed models on a held-out India tile set before claiming transfer."
      },
      %{
        id: "global-vs-local",
        problem_id: "geo-index",
        question: "Does a global foundation model hold, or does district fine-tune dominate?",
        reason: "contradiction",
        next: "Name the dataset shift. Pair one global checkpoint with one local fine-tune on the same tiles."
      },
      %{
        id: "consistency",
        problem_id: "geo-index",
        question: "Which method fuses satellite embeddings with census under an explicit consistency constraint?",
        reason: "missing-method",
        next: "Specify the constraint. A claim that cannot cite a span stays a note."
      }
    ]
  end

  def gap(id), do: Enum.find(gaps(), &(&1.id == id))

  def papers do
    [
      paper("satmae", "SatMAE: Pre-training Transformers for Temporal and Multi-Spectral Satellite Imagery",
        ["Yezhen Cong", "Samar Khanna", "Chenlin Meng"], 2022, "NeurIPS", 1100, 90,
        ["Remote sensing", "Foundation models"], "https://arxiv.org/abs/2207.08051", "2207.08051",
        "Masked autoencoder over temporal and multi-spectral satellite tiles, not RGB video.",
        "SatMAE shows a masked autoencoder can pretrain on multi-spectral, multi-temporal satellite imagery and transfer to classification and segmentation.",
        ["foundation-model", "self-supervised", "multispectral"], ["seco"], ["scalemae", "prithvi"],
        [%{text: "Temporal and spectral bands are treated as structure, not as extra channels glued onto an RGB model.", span: "Abstract", stance: "reports"}]),
      paper("seco", "Seasonal Contrast: Unsupervised Pre-Training from Uncurated Remote Sensing Data",
        ["Oscar Manas", "Alexandre Lacoste", "Xavier Giro-i-Nieto"], 2021, "ICCV", 700, 60,
        ["Remote sensing", "Self-supervision"], "https://arxiv.org/abs/2103.16607", "2103.16607",
        "Contrastive pretraining uses seasonal change in uncurated Sentinel imagery.",
        "SeCo treats images of the same place in different seasons as positives, so the representation keeps what is stable.",
        ["self-supervised", "change-detection"], [], ["satmae", "croma"],
        [%{text: "Seasonal views of one location are positives. The representation is pushed to ignore appearance shift that is not land-cover change.", span: "Abstract", stance: "reports"}]),
      paper("scalemae", "Scale-MAE: A Scale-Aware Masked Autoencoder for Multiscale Geospatial Representation Learning",
        ["Colorado J. Reed", "Ritwik Gupta", "Shufan Li"], 2023, "ICCV", 420, 40,
        ["Remote sensing", "Foundation models"], "https://arxiv.org/abs/2212.14532", "2212.14532",
        "Ground sample distance is an input, not an accident of the tile.",
        "Scale-MAE conditions reconstruction on absolute scale so a model trained at one resolution is less brittle at another.",
        ["foundation-model", "self-supervised", "multispectral"], ["satmae"], ["prithvi", "clay"],
        [%{text: "Scale is explicit. A tile at 10 m and a tile at 1 m are not the same example with a different crop.", span: "Abstract", stance: "supports"}]),
      paper("prithvi", "Foundation Models for Generalist Geospatial Artificial Intelligence",
        ["Johannes Jakubik", "Sujit Roy", "C. E. Phillips"], 2023, "arXiv", 800, 70,
        ["Remote sensing", "Foundation models"], "https://arxiv.org/abs/2310.18660", "2310.18660",
        "NASA-IBM HLS foundation model aimed at a family of Earth-observation tasks.",
        "Prithvi pretrains on Harmonized Landsat Sentinel imagery and is positioned as a generalist geospatial backbone.",
        ["foundation-model", "self-supervised", "multispectral", "data-fusion"], ["satmae", "scalemae"], ["spectralgpt", "clay"],
        [%{text: "The claim is generalist transfer across Earth-observation tasks, not a single benchmark.", span: "Abstract", stance: "supports"},
         %{text: "Published evaluations do not establish district-scale India coverage.", span: "Introduction", stance: "disputes"}]),
      paper("croma", "CROMA: Remote Sensing Representations with Contrastive Radar-Optical Masked Autoencoders",
        ["Anthony Fuller", "Koreen Millard", "James R. Green"], 2023, "NeurIPS", 260, 24,
        ["Remote sensing", "Data fusion"], "https://arxiv.org/abs/2311.00566", "2311.00566",
        "Optical and radar are aligned in one pretraining objective.",
        "CROMA jointly masks and contrasts SAR and optical views so the embedding is not optical-only.",
        ["data-fusion", "self-supervised", "multispectral"], ["seco", "satmae"], ["clay"],
        [%{text: "Radar and optical are trained together. Fusion is not a late concatenate step.", span: "Abstract", stance: "supports"}]),
      paper("satlas", "SatlasPretrain: A Large-Scale Dataset for Remote Sensing Image Understanding",
        ["Favyen Bastani", "Piper Wolters", "Ritwik Gupta"], 2023, "ICCV", 300, 28,
        ["Remote sensing", "Datasets"], "https://arxiv.org/abs/2211.15660", "2211.15660",
        "A large labeled pretrain set for high-resolution remote sensing.",
        "SatlasPretrain argues scale of labels, not only scale of unlabeled tiles, is the bottleneck.",
        ["foundation-model", "change-detection"], [], ["prithvi"],
        [%{text: "Label scale is treated as the limiting factor, separate from unlabeled pretraining.", span: "Abstract", stance: "reports"}]),
      paper("spectralgpt", "SpectralGPT: Spectral Remote Sensing Foundation Model",
        ["Danfeng Hong", "Bing Zhang", "Xuyang Li"], 2024, "IEEE TPAMI", 350, 30,
        ["Remote sensing", "Foundation models"], "https://arxiv.org/abs/2311.07113", "2311.07113",
        "A spectral foundation model trained to reconstruct band structure.",
        "SpectralGPT specialises the foundation-model claim onto spectral reconstruction rather than RGB transfer.",
        ["foundation-model", "multispectral"], ["prithvi", "satmae"], [],
        [%{text: "Spectral structure is the training target. RGB-only transfer is the wrong test.", span: "Abstract", stance: "supports"}]),
      paper("clay", "Clay: An Open Foundation Model for Earth Observation",
        ["Development Seed"], 2024, "Model release", 180, 12,
        ["Remote sensing", "Foundation models"], "https://clay-foundation.github.io/model/", nil,
        "Open weights for an Earth-observation foundation model, with an explicit open-data stance.",
        "Clay is the open-weights counterpoint to lab-only checkpoints in this seed.",
        ["foundation-model", "data-fusion"], ["prithvi", "scalemae", "croma"], [],
        [%{text: "Open weights make the checkpoint inspectable. They do not by themselves prove geographic coverage.", span: "Abstract", stance: "reports"}]),
      paper("gfm", "Towards Geospatial Foundation Models via Continual Pretraining",
        ["Matias Mendieta", "Boran Han", "Xingjian Shi"], 2023, "ICCV", 220, 18,
        ["Remote sensing", "Foundation models"], "https://arxiv.org/abs/2302.04476", "2302.04476",
        "Continual pretraining adapts an ImageNet model to remote sensing instead of training from scratch.",
        "GFM claims a cheaper path: start from a natural-image model and continue on satellite tiles.",
        ["foundation-model", "self-supervised"], ["satmae"], ["prithvi"],
        [%{text: "Continual pretraining is offered as the cheaper path versus a from-scratch geospatial model.", span: "Abstract", stance: "supports"}]),
      paper("changeformer", "A Transformer-Based Siamese Network for Change Detection",
        ["Wele Gedara Chaminda Bandara", "Vishal M. Patel"], 2022, "IGARSS", 500, 40,
        ["Change detection"], "https://arxiv.org/abs/2201.01293", "2201.01293",
        "A siamese transformer compares two dates for pixel change.",
        "ChangeFormer is a task model, not a foundation model. It is the seed's change-detection anchor.",
        ["change-detection"], [], [],
        [%{text: "Change is predicted from a pair of dates. There is no census or consistency term.", span: "Abstract", stance: "reports"}]),
      paper("worldpop", "High Resolution Global Gridded Population Data",
        ["Alessandro Sorichetta", "Graeme Hornby", "Forrest Stevens"], 2015, "Scientific Data", 900, 70,
        ["Population mapping"], "https://www.worldpop.org/", nil,
        "Dasymetric population grids used as the census side of a geo-local join.",
        "WorldPop is the population layer in the seed. It is not an imagery foundation model.",
        ["population", "data-fusion"], [], [],
        [%{text: "Population is a gridded estimate, not a headcount. Joining it to an embedding needs an explicit consistency rule.", span: "Abstract", stance: "disputes"}]),
      paper("skysense", "SkySense: A Multi-Modal Remote Sensing Foundation Model Towards Universal Interpretation",
        ["Xin Guo", "Jiangwei Lao", "Bo Dang"], 2024, "CVPR", 200, 16,
        ["Remote sensing", "Data fusion"], "https://arxiv.org/abs/2312.10115", "2312.10115",
        "Multi-modal remote-sensing foundation model aimed at universal interpretation.",
        "SkySense pushes the fusion claim further: more modalities, one interpretation model.",
        ["foundation-model", "data-fusion", "multispectral"], ["prithvi", "croma"], [],
        [%{text: "Universal interpretation is the claim. Geographic holdout, including India, is not the reported test.", span: "Abstract", stance: "disputes"}])
    ]
  end

  def paper(id), do: Enum.find(papers(), &(&1.id == id))

  def by_concept(concept_id), do: Enum.filter(papers(), &(concept_id in &1.concepts))

  defp paper(id, title, authors, year, venue, citations, influential, fields, url, arxiv, tldr, abstract, concepts, references, cited_by, claims) do
    %{
      id: id,
      source: "seed",
      title: title,
      authors: authors,
      year: year,
      venue: venue,
      citations: citations,
      influential: influential,
      counts_note: "illustrative seed figure",
      fields: fields,
      url: url,
      arxiv: arxiv,
      doi: nil,
      tldr: tldr,
      abstract: abstract,
      concepts: concepts,
      references: references,
      cited_by: cited_by,
      claims: Enum.with_index(claims, 1) |> Enum.map(fn {c, i} -> Map.merge(c, %{id: "#{id}-c#{i}", paper_id: id}) end)
    }
  end
end
