use model::GM;
use rand::Rng;

pub mod random;

pub(crate) type Score = i32;

struct Draft {
  gm: GM,
  score: Score
}

impl PartialEq for Draft {
  fn eq(&self, other: &Self) -> bool { self.score == other.score }
}

impl Eq for Draft {}

impl PartialOrd for Draft {
  fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
    Some(other.score.cmp(&self.score))
  }
}

impl Ord for Draft {
  fn cmp(&self, other: &Self) -> std::cmp::Ordering { self.score.cmp(&other.score) }
}

pub trait Design {
  fn draft(&self, gm: &mut GM, rng: &mut impl Rng);
  fn evalutate(&self, gm: &GM) -> Score { 0 }

  fn design(&self, gm: &mut GM, rng: &mut impl Rng) {
    let mut drafts: Vec<_> = (0..100)
      .map(|_| {
        let mut gm = gm.clone();
        self.draft(&mut gm, rng);
        let score = self.evalutate(&gm);
        Draft { gm, score }
      })
      .collect();
    drafts.sort();
    *gm = drafts.pop().unwrap().gm
  }
}
