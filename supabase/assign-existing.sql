insert into problem_assignments (problem_id, student_id)
select problems.id, profiles.id
from problems
cross join profiles
where profiles.role = 'student'
  and problems.published = true
on conflict (problem_id, student_id) do nothing;
