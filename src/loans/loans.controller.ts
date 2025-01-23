import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { LoansService } from './loans.service';

@Controller('loans')
export class LoansController {
  constructor(private loansService: LoansService) {}

  @Get('history')
  @UseGuards(AuthGuard)
  getLoanHistory(@Request() req) {
    return this.loansService.findLoansByUser(req.user.sub);
  }
}