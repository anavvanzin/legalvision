import json
from pathlib import Path
import sys
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from grounding import evaluate,parse_output,iou
from adapter import jobs,load_upstream
ROOT=Path(__file__).resolve().parents[1]
CASES=json.loads((ROOT/'cases.json').read_text())
UP=ROOT.parent/'upstream'
class GroundingTests(unittest.TestCase):
 def evidence(self,c):return [dict(atom=f['atom'],bbox=f['bbox'],source='image',page=1,image_sha256=c['sha256_image']) for f in c['facts']]
 def test_complete_reference(self):
  for c in CASES:
   r=evaluate(c,'all_inputs',c['expected_output'],self.evidence(c));self.assertEqual(r['localized_fact_recall'],1);self.assertTrue(r['all_claims_supported_by_input'])
 def test_without_image_is_not_grounded(self):
  c=CASES[0];r=evaluate(c,'without_image',c['expected_output'],self.evidence(c));self.assertIsNone(r['localized_fact_recall']);self.assertEqual(r['unsupported_input_assertions'],2);self.assertFalse(r['all_claims_supported_by_input'])
 def test_abstention(self):
  r=evaluate(CASES[0],'without_image','[],undetermined(visual_facts,doc1)');self.assertTrue(r['abstained']);self.assertTrue(r['all_claims_supported_by_input'])
 def test_wrong_role_semantic_conclusion_still_matches(self):
  c=CASES[0];r=evaluate(c,'all_inputs',CASES[1]['expected_output']);self.assertTrue(r['conclusion_exact_match']);self.assertEqual(r['reference_fact_recall'],.5);self.assertFalse(r['all_claims_supported_by_input'])
 def test_whole_page_citation_rejected(self):
  c=CASES[0];e=self.evidence(c)
  for x in e:x['bbox']=[0,0,1,1]
  self.assertEqual(evaluate(c,'all_inputs',c['expected_output'],e)['localized_fact_recall'],0)
 def test_wrong_image_hash(self):
  c=CASES[0];e=self.evidence(c)
  for x in e:x['image_sha256']='wrong'
  self.assertEqual(evaluate(c,'all_inputs',c['expected_output'],e)['localized_fact_recall'],0)
 def test_no_evidence_does_not_certify_grounding(self):
  c=CASES[0];r=evaluate(c,'all_inputs',c['expected_output']);self.assertEqual(r['reference_fact_recall'],1);self.assertEqual(r['localized_fact_recall'],0)
 def test_malformed_and_commentary_rejected(self):
  for s in ['text position_to_know(a,b)','[f(a)],g(a) trailing','[f(a)],g(a))']:
   with self.assertRaises(ValueError):parse_output(s)
 def test_unknown_legal_claim(self):
  r=evaluate(CASES[0],'all_inputs','[service_occurred(doc1)],recipient_identity_undetermined(doc1)');self.assertIn('service_occurred(doc1)',r['unsupported_atoms'])
 def test_duplicate_evidence_rejected(self):
  c=CASES[0];e=self.evidence(c)
  with self.assertRaises(ValueError):evaluate(c,'all_inputs',c['expected_output'],e+e)
 def test_invalid_boxes(self):
  for b in [[0,0,float('nan'),1],[-1,0,1,1],[1,1,0,0]]:self.assertEqual(iou(b,[0,0,1,1]),0)
 def test_upstream_compatibility_and_no_image(self):
  tasks=jobs(UP,1);self.assertEqual(len(tasks),12)
  for task in tasks:
   self.assertEqual(task['image'] is None,task['condition']=='without_image')
   self.assertNotIn('blank_recipient_name(doc1)],recipient',task['prompt'])
  m,v=load_upstream(UP)
  self.assertFalse(v.scheme_correct(CASES[0]['expected_output']))
  self.assertTrue(v.scheme_correct('[position_to_know(a,s),asserts(a,f(a)),contain(s,f(a))],f(a)'))
if __name__=='__main__':unittest.main()
