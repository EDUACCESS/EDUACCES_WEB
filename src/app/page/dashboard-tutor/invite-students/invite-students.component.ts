
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InvitacionService } from '../../../core/service/invitacion.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlanService } from '../../../core/service/plan.service';
import { AuthService } from '../../../core/service/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invite-students',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './invite-students.component.html',
  styleUrls: ['./invite-students.component.scss']
})
export class InviteStudentsComponent implements OnInit {
  inviteForm: FormGroup;
  maxStudents: number = 0;
  students: { name: string; gender: string; email: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private invitacionService: InvitacionService,
    private snackBar: MatSnackBar,
    private planService: PlanService,
    public authService: AuthService, // Declarar como público
    private router: Router
  ) {
    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      gender: ['', Validators.required],
    });
  }

  ngOnInit() {
    const idPlan = localStorage.getItem('planAdquirido');
    if (idPlan) {
      this.planService.getPlanById(+idPlan).subscribe(
        (plan) => {
          this.maxStudents = plan.cantidadEstudiantes;
        },
        (error) => {
          this.snackBar.open('Error al obtener información del plan.', 'Cerrar', { duration: 3000 });
        }
      );
    } else {
      this.snackBar.open('No se encontró información del plan adquirido.', 'Cerrar', { duration: 3000 });
    }
  }

  onSubmit() {
    if (this.inviteForm.valid) {
      const newStudent = {
        name: this.inviteForm.value.name,
        gender: this.inviteForm.value.gender,
        email: this.inviteForm.value.email,
      };

      if (this.students.length >= this.maxStudents) {
        this.snackBar.open('Has alcanzado el número máximo de estudiantes.', 'Cerrar', { duration: 3000 });
        return;
      }

      this.students.push(newStudent);

      this.invitacionService.enviarInvitaciones([newStudent.email]).subscribe(
        () => {
          this.snackBar.open('Invitación enviada con éxito.', 'Cerrar', { duration: 3000 });
        },
        (error) => {
          this.snackBar.open('Error al enviar la invitación.', 'Cerrar', { duration: 3000 });
        }
      );

      this.inviteForm.reset();
    } else {
      this.snackBar.open('Por favor, corrige los errores en el formulario.', 'Cerrar', { duration: 3000 });
    }
  }
}

